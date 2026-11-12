export function getNotificationDestination(notification, role) {
  const eventId = notification?.relatedEvent;

  if (role === "student") {
    if (notification?.type === "certificate_generated") return "/student/activities";
    return eventId ? "/student/events" : null;
  }

  if (role === "coordinator") {
    if (
      eventId &&
      ["student_registered", "attendance_marked"].includes(notification?.type)
    ) {
      return `/coordinator/event/${eventId}/registrations`;
    }
    return eventId ? "/coordinator/events" : null;
  }

  if (role === "admin") return eventId ? "/eventManagement" : null;
  return null;
}

