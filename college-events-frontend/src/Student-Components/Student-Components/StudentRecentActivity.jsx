import "./StudentRecentActivity.css";

const activities = [
  { id: 1, action: "Registered for", event: "Annual Tech Fest 2024", time: "2 hours ago" },
  { id: 2, action: "Certificate earned for", event: "Coding Bootcamp", time: "1 day ago" },
  { id: 3, action: "Attended", event: "Guest Lecture: Future of Work", time: "3 days ago" },
  { id: 4, action: "Registered for", event: "Workshop: AI & Machine Learning", time: "5 days ago" },
];

const StudentRecentActivity = () => {
  return (
    <div className="activity-card">
      <h3>Recent Activity</h3>
      <div className="timeline">
        {activities.map((a, i) => (
          <div key={a.id} className="timeline-item">
            <div className="dot" />
            <div className="content">
              <p>
                {a.action}{" "}
                <span className="event-name">{a.event}</span>
              </p>
              <small>{a.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentRecentActivity;