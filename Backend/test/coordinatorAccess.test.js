const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");
const { test } = require("node:test");

const controllerPath = path.resolve(__dirname, "../Controller/coordinatorController.js");

const response = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const loadController = () => {
  const originalLoad = Module._load;
  const calls = { eventFind: [], eventFindOne: [], userFind: [], userCount: [] };
  const students = [
    { _id: "mca-student-1", name: "MCA Student 1", email: "mca1@example.com", course: "MCA", year: "1st Year" },
    { _id: "mca-student-2", name: "MCA Student 2", email: "mca2@example.com", course: "MCA", year: "2nd Year" },
    { _id: "bca-student-1", name: "BCA Student 1", email: "bca1@example.com", course: "BCA", year: "1st Year" },
  ];
  const events = [
    {
      _id: "mca-event-a",
      title: "MCA Event A",
      course: "MCA",
      registeredStudent: [students[0], students[1], students[2]],
      attendedStudents: [],
      participatedStudents: [],
      certificatesIssued: [],
    },
    {
      _id: "mca-event-b",
      title: "MCA Event B",
      course: "MCA",
      registeredStudent: [],
      attendedStudents: [],
      participatedStudents: [],
      certificatesIssued: [],
    },
    {
      _id: "bca-event-c",
      title: "BCA Event C",
      course: "BCA",
      registeredStudent: [students[2]],
      attendedStudents: [],
      participatedStudents: [],
      certificatesIssued: [],
    },
  ];

  const findEvents = (query) => {
    calls.eventFind.push(query);
    return {
      sort: async () => events.filter((event) => event.course === query.course),
      select: async () => events.filter((event) => event.course === query.course),
    };
  };

  const findOneEvent = (query) => {
    calls.eventFindOne.push(query);
    const event = events.find(
      (candidate) => candidate._id === query._id && candidate.course === query.course
    );
    const chain = {
      populate() {
        return chain;
      },
      then(resolve, reject) {
        return Promise.resolve(event).then(resolve, reject);
      },
    };
    return chain;
  };

  const User = {
    find(query) {
      calls.userFind.push(query);
      return {
        select: async () => students.filter(
          (student) => student.course === query.course
        ),
      };
    },
    countDocuments: async (query) => {
      calls.userCount.push(query);
      return students.filter(
        (student) => query.role === "student" && student.course === query.course
      ).length;
    },
  };

  const Event = {
    find: findEvents,
    findOne: findOneEvent,
    countDocuments: async (query) => events.filter((event) => event.course === query.course).length,
  };

  const middleware = () => (req, res, next) => next();
  const upload = { single: middleware };

  Module._load = function mockedLoad(request, parent, isMain) {
    if (request === "../models/User") return User;
    if (request === "../models/Event") return Event;
    if (request === "../config/imageKit") return async () => "image";
    if (request === "../config/sendEventEmail") return async () => {};
    if (request === "../utils/activityLogger") return async () => {};
    if (request === "../utils/notificationLogger") return async () => {};
    if (request === "../Middleware/upload") return upload;
    return originalLoad.call(this, request, parent, isMain);
  };

  delete require.cache[controllerPath];
  const controller = require(controllerPath);
  Module._load = originalLoad;
  return { controller, calls, students, events };
};

test("coordinators share events and registered students within their course only", async () => {
  const { controller, calls, students } = loadController();

  const mcaEventsResponse = response();
  await controller.coordinatorEvents({ user: { _id: "coordinator-a", course: "MCA" } }, mcaEventsResponse);
  assert.deepEqual(mcaEventsResponse.body.map((event) => event._id), ["mca-event-a", "mca-event-b"]);

  const bcaEventsResponse = response();
  await controller.coordinatorEvents({ user: { _id: "coordinator-c", course: "BCA" } }, bcaEventsResponse);
  assert.deepEqual(bcaEventsResponse.body.map((event) => event._id), ["bca-event-c"]);

  const registeredResponse = response();
  await controller.getStudentFromEvents(
    { params: { id: "mca-event-a" }, user: { _id: "coordinator-b", course: "MCA" } },
    registeredResponse
  );
  assert.deepEqual(registeredResponse.body.map((student) => student._id), [
    students[0]._id,
    students[1]._id,
  ]);
  assert.equal(calls.eventFindOne.at(-1).course, "MCA");

  const crossDepartmentResponse = response();
  await controller.getStudentFromEvents(
    { params: { id: "mca-event-a" }, user: { _id: "coordinator-c", course: "BCA" } },
    crossDepartmentResponse
  );
  assert.equal(crossDepartmentResponse.statusCode, 404);
});

test("department students and coordinator dashboard stats use authenticated course", async () => {
  const { controller, calls } = loadController();

  const mcaStudentsA = response();
  await controller.departmentStudents({ user: { _id: "coordinator-a", course: "MCA" } }, mcaStudentsA);
  const mcaStudentsB = response();
  await controller.departmentStudents({ user: { _id: "coordinator-b", course: "MCA" } }, mcaStudentsB);
  const bcaStudents = response();
  await controller.departmentStudents({ user: { _id: "coordinator-c", course: "BCA" } }, bcaStudents);

  assert.equal(mcaStudentsA.body.length, 2);
  assert.deepEqual(mcaStudentsA.body.map((student) => student.course), ["MCA", "MCA"]);
  assert.deepEqual(mcaStudentsB.body, mcaStudentsA.body);
  assert.equal(bcaStudents.body.length, 1);
  assert.equal(bcaStudents.body[0].course, "BCA");

  const dashboardResponse = response();
  await controller.getDashboardStats({ user: { _id: "coordinator-b", course: "MCA" } }, dashboardResponse);
  assert.equal(dashboardResponse.body.totalEvents, 2);
  assert.equal(dashboardResponse.body.totalStudents, 2);
  assert.equal(dashboardResponse.body.totalRegistrations, 3);
  assert.equal(calls.userCount.at(-1).course, "MCA");
  assert.equal(calls.eventFind.at(-1).course, "MCA");
});

test("coordinator access is denied when authenticated course is missing", async () => {
  const { controller } = loadController();
  const responseWithoutCourse = response();

  await controller.coordinatorEvents({ user: { _id: "coordinator-without-course" } }, responseWithoutCourse);

  assert.equal(responseWithoutCourse.statusCode, 403);
  assert.match(responseWithoutCourse.body.message, /department is required/i);
});
