const MailjetDelivery = require("../models/MailjetDelivery");

const MAILJET_API_URL = "https://api.mailjet.com/v3.1/send";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BATCH_SIZE = 50;
const MAX_RATE_LIMIT_RETRIES = 3;
const BATCH_DELAY_MS = 250;
const REQUEST_TIMEOUT_MS = 15000;
const STALE_SENDING_MS = 10 * 60 * 1000;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const formatEventDate = (date) => new Date(date).toLocaleDateString("en-IN");

const createEventMessage = (studentName, event) => `Hello ${studentName || "Student"},

A new event has been created for your course on CampusHub.

Event: ${event.title}
Description: ${event.description || "No description provided."}
Date: ${formatEventDate(event.date)}
Time: ${event.time || event.startTime || "Not specified"}
Venue: ${event.venue || "Not specified"}
Category: ${event.category || "Not specified"}
Registration instructions: ${event.instructions || "Please log in to CampusHub to register."}

Regards,
CampusHub Team`;

// Do not log provider response text: it may contain recipient data.
const getErrorMessage = (status) => `HTTP ${status}`;

const retryAfterMilliseconds = (response) => {
  const value = response.headers?.get?.("retry-after");
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 30000);
  const dateMilliseconds = Date.parse(value);
  return Number.isNaN(dateMilliseconds)
    ? null
    : Math.min(Math.max(dateMilliseconds - Date.now(), 0), 30000);
};

const sendBatchToMailjet = async (batch, event) => {
  const credentials = Buffer.from(
    `${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`
  ).toString("base64");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(MAILJET_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Basic ${credentials}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        Messages: batch.map((student) => ({
          From: { Email: process.env.MAILJET_SENDER_EMAIL, Name: process.env.MAILJET_SENDER_NAME },
          To: [{ Email: student.email, Name: student.name || "Student" }],
          Subject: `New Campus Event: ${event.title}`,
          TextPart: createEventMessage(student.name, event),
        })),
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const responseText = await response.text();
  let responseBody = null;
  try { responseBody = responseText ? JSON.parse(responseText) : null; } catch { responseBody = null; }

  if (!response.ok) {
    const error = new Error(`Mailjet API rejected batch (${response.status}): ${getErrorMessage(response.status)}`);
    error.status = response.status;
    error.retryAfterMs = retryAfterMilliseconds(response);
    throw error;
  }
  if (!responseBody || !Array.isArray(responseBody.Messages)) {
    throw new Error("Mailjet returned an invalid response: Messages array is missing.");
  }
  if (responseBody.Messages.length !== batch.length) {
    throw new Error(`Mailjet returned ${responseBody.Messages.length} message result(s) for ${batch.length} recipient(s).`);
  }

  return responseBody.Messages.map((message, index) => {
    const recipient = batch[index];
    const to = Array.isArray(message?.To) ? message.To : [];
    const returnedEmail = typeof to[0]?.Email === "string" ? to[0].Email.trim().toLowerCase() : "";
    const providerMessageId = typeof to[0]?.MessageUUID === "string" ? to[0].MessageUUID.trim() : "";
    const accepted = message?.Status === "success" &&
      to.length === 1 && returnedEmail === recipient.email && providerMessageId.length > 0;
    return {
      email: recipient.email,
      status: accepted ? "accepted" : "failed",
      providerMessageId: accepted ? providerMessageId : "",
      error: accepted ? "" : "Mailjet returned an incomplete or unsuccessful message result.",
    };
  });
};

const sendBatchWithRateLimitHandling = async (batch, event) => {
  for (let retryNumber = 0; retryNumber <= MAX_RATE_LIMIT_RETRIES; retryNumber += 1) {
    try { return await sendBatchToMailjet(batch, event); } catch (error) {
      if (error.status !== 429 || retryNumber === MAX_RATE_LIMIT_RETRIES) throw error;
      const fallbackDelay = Math.min(30000, 1000 * (2 ** retryNumber));
      await sleep(error.retryAfterMs == null ? fallbackDelay : error.retryAfterMs);
    }
  }
  throw new Error("Mailjet retry limit reached.");
};

const validateConfiguration = () => {
  const required = ["MAILJET_API_KEY", "MAILJET_SECRET_KEY", "MAILJET_SENDER_EMAIL", "MAILJET_SENDER_NAME"];
  if (required.some((name) => !process.env[name])) throw new Error("Mailjet email configuration is incomplete.");
};

const normalizeRecipients = (students) => {
  const uniqueRecipients = new Map();
  let invalidCount = 0;
  let duplicateCount = 0;
  for (const student of students) {
    const email = typeof student.email === "string" ? student.email.trim().toLowerCase() : "";
    if (!EMAIL_PATTERN.test(email)) invalidCount += 1;
    else if (uniqueRecipients.has(email)) duplicateCount += 1;
    else uniqueRecipients.set(email, { ...student, email });
  }
  return { recipients: [...uniqueRecipients.values()], invalidCount, duplicateCount };
};

const ensureDelivery = (eventId, student) => MailjetDelivery.findOneAndUpdate(
  { event: eventId, email: student.email },
  { $setOnInsert: { event: eventId, email: student.email, status: "pending", attempts: 0 } },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);

const claimDelivery = (eventId, email, now) => {
  const staleBefore = new Date(now.getTime() - STALE_SENDING_MS);
  return MailjetDelivery.findOneAndUpdate(
    {
      event: eventId,
      email,
      $or: [
        { status: "pending" },
        { status: "failed" },
        { status: "sending", sendingAt: { $lt: staleBefore } },
      ],
    },
    { $set: { status: "sending", sendingAt: now, lastError: "", completedAt: null }, $inc: { attempts: 1 } },
    { new: true }
  );
};

const saveResult = async (delivery, result) => {
  delivery.status = result.status;
  delivery.providerMessageId = result.providerMessageId || "";
  delivery.lastError = result.error || "";
  delivery.sendingAt = null;
  delivery.completedAt = new Date();
  await delivery.save();
};

const failBatch = async (claimed, error) => Promise.all(
  claimed.map(({ delivery }) => saveResult(delivery, { status: "failed", error: error.message }))
);

const sendEventEmail = async (students, event) => {
  if (!Array.isArray(students) || students.length === 0) {
    console.log("No students found for email notification.");
    return { sentBatches: 0, failedBatches: 0 };
  }
  validateConfiguration();
  const { recipients, invalidCount, duplicateCount } = normalizeRecipients(students);
  const eventId = event._id || event.id;
  const claimed = [];

  for (const student of recipients) {
    await ensureDelivery(eventId, student);
    const delivery = await claimDelivery(eventId, student.email, new Date());
    if (delivery) claimed.push({ student, delivery });
  }

  let sentBatches = 0;
  let failedBatches = 0;
  let acceptedRecipients = 0;
  let failedRecipients = 0;

  for (let index = 0; index < claimed.length; index += BATCH_SIZE) {
    const batch = claimed.slice(index, index + BATCH_SIZE);
    try {
      const results = await sendBatchWithRateLimitHandling(batch.map(({ student }) => student), event);
      let batchHadFailure = false;
      await Promise.all(batch.map(async ({ delivery }, resultIndex) => {
        const result = results[resultIndex];
        if (result.status === "accepted") acceptedRecipients += 1;
        else { failedRecipients += 1; batchHadFailure = true; }
        await saveResult(delivery, result);
      }));
      if (batchHadFailure) failedBatches += 1;
      else sentBatches += 1;
    } catch (error) {
      await failBatch(batch, error);
      failedBatches += 1;
      failedRecipients += batch.length;
      console.error(`Mailjet batch ${Math.floor(index / BATCH_SIZE) + 1} failed:`, error.message);
    }
    if (index + BATCH_SIZE < claimed.length) await sleep(BATCH_DELAY_MS);
  }

  console.log(`Mailjet event notification summary: ${acceptedRecipients} recipient(s) accepted, ${failedRecipients} failed, ${invalidCount} invalid, ${duplicateCount} duplicate skipped.`);
  return { sentBatches, failedBatches, acceptedRecipients, failedRecipients, invalidCount, duplicateCount };
};

module.exports = sendEventEmail;
