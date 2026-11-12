const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");
const { test } = require("node:test");

const controllerPath = path.resolve(__dirname, "../Controller/coordinatorController.js");
const adminRoutesPath = path.resolve(__dirname, "../routes/adminEvents.js");

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(payload) { this.body = payload; return this; },
});

const loadWithMocks = ({ emailError = null, eventForEdit = null } = {}) => {
  const originalLoad = Module._load;
  const calls = { email: [], userQueries: [], notifications: [], savedEvents: [] };
  const Event = function Event(data) {
    Object.assign(this, data);
    this._id = "created-event";
    this.save = async () => { calls.savedEvents.push(this); return this; };
  };
  Event.find = () => ({ select: async () => [] });
  Event.findById = () => ({ select: async () => eventForEdit });
  Event.findByIdAndUpdate = async () => eventForEdit;

  const User = {
    find(query) {
      calls.userQueries.push(query);
      return { select: async () => [{ name: "MCA Student", email: "mca@example.com" }] };
    },
  };
  const sendEventEmail = async (students, event) => {
    calls.email.push({ students, event });
    if (emailError) throw new Error(emailError);
  };
  const uploadFile = async () => "https://example.com/event.jpg";
  const createNotification = async (notification) => { calls.notifications.push(notification); };
  const middleware = () => (req, res, next) => next();
  const upload = { single: middleware };

  Module._load = function mockedLoad(request, parent, isMain) {
    if (request === "../models/User") return User;
    if (request === "../models/Event") return Event;
    if (request === "../config/imageKit") return uploadFile;
    if (request === "../config/sendEventEmail") return sendEventEmail;
    if (request === "../utils/activityLogger") return async () => {};
    if (request === "../utils/notificationLogger") return createNotification;
    if (request === "../Middleware/authMiddleware" || request === "../Middleware/roleMiddleware") return middleware;
    if (request === "../Middleware/upload") return upload;
    return originalLoad.call(this, request, parent, isMain);
  };

  delete require.cache[controllerPath];
  delete require.cache[adminRoutesPath];
  const controller = require(controllerPath);
  const adminRoutes = require(adminRoutesPath);
  Module._load = originalLoad;
  return { controller, adminRoutes, calls };
};

const validCreateRequest = () => ({
  body: {
    title: "Campus Event",
    description: "Description",
    date: "2026-12-01",
    startTime: "10:00",
    endTime: "11:00",
    venue: "Hall A",
    category: "Workshop",
    capacity: "50",
    instructions: "Register in CampusHub",
  },
  file: { buffer: Buffer.from("image") },
  user: { course: "MCA" },
});

test("coordinator creation filters students by coordinator course and succeeds when email fails", async () => {
  const { controller, calls } = loadWithMocks({ emailError: "Mailjet unavailable" });
  const req = validCreateRequest();
  const res = createResponse();
  await controller.createCoordinatorEvent(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.message, "Event created successfully!");
  assert.deepEqual(calls.userQueries[0], { role: "student", course: "MCA" });
  assert.equal(calls.email.length, 1);
  assert.equal(calls.email[0].event.course, "MCA");
});

test("admin event editing does not invoke the email helper", async () => {
  const event = {
    _id: "event-1",
    title: "Existing Event",
    date: new Date("2026-12-01T00:00:00.000Z"),
    time: "10:00",
    venue: "Hall A",
    registeredStudent: [],
  };
  const { adminRoutes, calls } = loadWithMocks({ eventForEdit: event });
  const layer = adminRoutes.stack.find((item) => item.route?.path === "/events/:id");
  const handler = layer.route.stack.at(-1).handle;
  const req = { params: { id: "event-1" }, body: { title: "Edited Event" } };
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, "Event updated successfully");
  assert.equal(calls.email.length, 0);
});
