const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");
const { test } = require("node:test");

const controllerPath = path.resolve(__dirname, "../Controller/notificationController.js");

const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(payload) { this.body = payload; return this; },
});

const loadController = ({ findResult = [], counts = [0, 0] } = {}) => {
  const calls = { find: [], one: [], many: [] };
  let countIndex = 0;
  const Notification = {
    find(filter) {
      calls.find.push(filter);
      return {
        sort() { return this; },
        skip() { return this; },
        limit: async () => findResult,
      };
    },
    countDocuments: async (filter) => {
      calls.find.push({ count: filter });
      return counts[countIndex++] ?? 0;
    },
    findOneAndUpdate: async (filter, update, options) => {
      calls.one.push({ filter, update, options });
      return null;
    },
    updateMany: async (filter, update) => {
      calls.many.push({ filter, update });
      return { modifiedCount: 1 };
    },
  };

  const originalLoad = Module._load;
  Module._load = function mockedLoad(request, parent, isMain) {
    if (request === "../models/Notification") return Notification;
    return originalLoad.call(this, request, parent, isMain);
  };

  delete require.cache[controllerPath];
  const controller = require(controllerPath);
  Module._load = originalLoad;
  return { controller, calls };
};

const user = {
  _id: "507f1f77bcf86cd799439011",
  role: "admin",
};

test("notification list is recipient-scoped and paginated", async () => {
  const { controller, calls } = loadController({
    findResult: [{ _id: "notification-1" }],
    counts: [6, 2],
  });
  const res = response();

  await controller.getNotifications(
    { user, query: { page: "2", limit: "3" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(calls.find[0], {
    count: { recipient: user._id, recipientRole: user.role },
  });
  assert.deepEqual(calls.find[1], {
    recipient: user._id,
    recipientRole: user.role,
  });
  assert.equal(res.body.unreadCount, 2);
  assert.deepEqual(res.body.pagination, {
    page: 2,
    limit: 3,
    total: 6,
    totalPages: 2,
    hasMore: false,
  });
});

test("invalid notification IDs return 400 without querying MongoDB", async () => {
  const { controller, calls } = loadController();
  const res = response();

  await controller.markAsRead(
    { user, params: { id: "not-an-object-id" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.equal(calls.one.length, 0);
  assert.equal(res.body.message, "Invalid notification ID");
});

test("mark-as-read and mark-all-read remain scoped to the authenticated role", async () => {
  const { controller, calls } = loadController();
  const resOne = response();
  const resAll = response();

  await controller.markAsRead(
    { user, params: { id: "507f1f77bcf86cd799439012" } },
    resOne
  );
  await controller.markAllAsRead({ user }, resAll);

  assert.equal(resOne.statusCode, 404);
  assert.deepEqual(calls.one[0].filter, {
    _id: "507f1f77bcf86cd799439012",
    recipient: user._id,
    recipientRole: user.role,
  });
  assert.deepEqual(calls.many[0].filter, {
    recipient: user._id,
    recipientRole: user.role,
    isRead: false,
  });
  assert.equal(resAll.statusCode, 200);
});

