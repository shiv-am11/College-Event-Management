const assert = require("node:assert/strict");
const { test, afterEach } = require("node:test");

process.env.MAILJET_API_KEY = "test-api-key";
process.env.MAILJET_SECRET_KEY = "test-secret-key";
process.env.MAILJET_SENDER_EMAIL = "sender@example.com";
process.env.MAILJET_SENDER_NAME = "CampusHub";

const sendEventEmail = require("../config/sendEventEmail");
const MailjetDelivery = require("../models/MailjetDelivery");
const originalFindOneAndUpdate = MailjetDelivery.findOneAndUpdate;

const clone = (value) => ({
  ...value,
  save: async function save() {
    this.store.set(`${this.event}:${this.email}`, this);
  },
});

const createStore = (initial = []) => {
  const store = new Map();
  for (const item of initial) {
    store.set(`${item.event}:${item.email}`, { ...item, store });
  }

  return {
    store,
    async findOneAndUpdate(filter, update, options = {}) {
      const key = `${filter.event}:${filter.email}`;
      let record = store.get(key);
      if (!record && options.upsert) {
        record = { ...update.$setOnInsert, store, createdAt: new Date() };
        store.set(key, record);
      }
      if (!record) return null;

      if (filter.$or) {
        const matches = filter.$or.some((condition) => {
          if (condition.status === "pending" || condition.status === "failed") {
            return record.status === condition.status;
          }
          return record.status === "sending" && record.sendingAt < condition.sendingAt.$lt;
        });
        if (!matches) return null;
      }

      if (update.$set) Object.assign(record, update.$set);
      if (update.$inc) {
        for (const [field, amount] of Object.entries(update.$inc)) {
          record[field] = (record[field] || 0) + amount;
        }
      }
      return clone(record);
    },
  };
};

const event = { _id: "event-test", title: "Campus Event", date: "2026-12-01" };
const student = (index) => ({ name: `Student ${index}`, email: `student${index}@example.com` });

const response = (body, status = 200, headers = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: (name) => headers[name] || null },
  text: async () => JSON.stringify(body),
});

const installFetch = (responses, calls = []) => {
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    const next = responses.shift();
    return typeof next === "function" ? next(url, options) : next;
  };
  return calls;
};

const successfulBody = (messages) => ({
  Messages: messages.map((message) => ({
    Status: "success",
    To: [{ Email: message.To[0].Email, MessageUUID: `uuid-${message.To[0].Email}` }],
  })),
});

afterEach(() => {
  delete global.fetch;
  MailjetDelivery.findOneAndUpdate = originalFindOneAndUpdate;
});

const useStore = (store) => {
  MailjetDelivery.findOneAndUpdate = store.findOneAndUpdate.bind(store);
};

test("tracks 49 accepted and 1 failed recipient", async () => {
  const store = createStore();
  useStore(store);
  const recipients = Array.from({ length: 50 }, (_, index) => student(index));
  const calls = installFetch([
    (url, options) => {
      const request = JSON.parse(options.body);
      return response({ Messages: request.Messages.map((message, index) => ({
        Status: index === 49 ? "error" : "success",
        To: [{ Email: message.To[0].Email, MessageUUID: index === 49 ? "" : `uuid-${index}` }],
      })) });
    },
    (url, options) => response(successfulBody(JSON.parse(options.body).Messages)),
  ]);

  const first = await sendEventEmail(recipients, event);
  assert.equal(first.acceptedRecipients, 49);
  assert.equal(first.failedRecipients, 1);
  assert.equal(store.store.get("event-test:student49@example.com").status, "failed");

  assert.equal(calls.length, 1);
});

test("retries only the failed recipient", async () => {
  const store = createStore();
  useStore(store);
  const recipients = [student(0), student(1)];
  const calls = installFetch([
    (url, options) => {
      const request = JSON.parse(options.body);
      return response({ Messages: request.Messages.map((message, index) => ({
        Status: index === 1 ? "error" : "success",
        To: [{ Email: message.To[0].Email, MessageUUID: index === 1 ? "" : "uuid-0" }],
      })) });
    },
    (url, options) => response(successfulBody(JSON.parse(options.body).Messages)),
  ]);
  await sendEventEmail(recipients, event);
  await sendEventEmail(recipients, event);
  assert.equal(calls.length, 2);
  assert.deepEqual(JSON.parse(calls[1].options.body).Messages.map((message) => message.To[0].Email), ["student1@example.com"]);
});

test("rejects an HTTP 200 response with a missing Messages array", async () => {
  const store = createStore();
  useStore(store);
  installFetch([response({})]);
  const result = await sendEventEmail([student(0)], event);
  assert.equal(result.failedRecipients, 1);
  assert.equal(store.store.get("event-test:student0@example.com").status, "failed");
});

test("rejects a malformed message response and a count mismatch", async () => {
  for (const body of [{ Messages: [{ Status: "success" }] }, { Messages: [] }]) {
    const store = createStore();
    useStore(store);
    installFetch([response(body)]);
    const result = await sendEventEmail([student(0)], { ...event, _id: `event-${Math.random()}` });
    assert.equal(result.failedRecipients, 1);
    assert.equal([...store.store.values()][0].status, "failed");
  }
});

test("rejects a successful message without a provider message ID", async () => {
  const store = createStore();
  useStore(store);
  installFetch([response({ Messages: [{ Status: "success", To: [{ Email: "student0@example.com" }] }] })]);
  const result = await sendEventEmail([student(0)], event);
  assert.equal(result.failedRecipients, 1);
  assert.equal(store.store.get("event-test:student0@example.com").status, "failed");
});

test("does not claim a fresh sending record after a simulated process crash", async () => {
  const store = createStore([{
    event: event._id,
    email: "student0@example.com",
    status: "sending",
    attempts: 1,
    sendingAt: new Date(),
  }]);
  useStore(store);
  const calls = installFetch([]);
  await sendEventEmail([student(0)], event);
  assert.equal(calls.length, 0);
  assert.equal(store.store.get("event-test:student0@example.com").status, "sending");
});

test("recovers a stale sending record after the timeout", async () => {
  const staleDate = new Date(Date.now() - (10 * 60 * 1000) - 1000);
  const store = createStore([{
    event: event._id,
    email: "student0@example.com",
    status: "sending",
    attempts: 1,
    sendingAt: staleDate,
  }]);
  useStore(store);
  const calls = installFetch([(url, options) => response(successfulBody(JSON.parse(options.body).Messages))]);
  await sendEventEmail([student(0)], event);
  assert.equal(calls.length, 1);
  assert.equal(store.store.get("event-test:student0@example.com").status, "accepted");
});

test("prevents two concurrent retry requests from double-claiming", async () => {
  const store = createStore([{
    event: event._id,
    email: "student0@example.com",
    status: "failed",
    attempts: 1,
  }]);
  useStore(store);
  const calls = installFetch([async (url, options) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return response(successfulBody(JSON.parse(options.body).Messages));
  }]);
  await Promise.all([
    sendEventEmail([student(0)], event),
    sendEventEmail([student(0)], event),
  ]);
  assert.equal(calls.length, 1);
  assert.equal(store.store.get("event-test:student0@example.com").status, "accepted");
});

test("honors Retry-After on a 429 response", async () => {
  const store = createStore();
  useStore(store);
  const calls = installFetch([
    response({ ErrorMessage: "Rate limited" }, 429, { "retry-after": "0.01" }),
    (url, options) => response(successfulBody(JSON.parse(options.body).Messages)),
  ]);
  const result = await sendEventEmail([student(0)], event);
  assert.equal(result.acceptedRecipients, 1);
  assert.equal(calls.length, 2);
});

test("never sends an already accepted recipient again", async () => {
  const store = createStore();
  useStore(store);
  const calls = installFetch([(url, options) => response(successfulBody(JSON.parse(options.body).Messages))]);
  await sendEventEmail([student(0)], event);
  await sendEventEmail([student(0)], event);
  assert.equal(calls.length, 1);
});
