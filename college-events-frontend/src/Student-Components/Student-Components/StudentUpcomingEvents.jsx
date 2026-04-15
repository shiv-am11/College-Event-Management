import { useEffect, useState } from "react";
import "./StudentUpcomingEvents.css"
const StudentUpcomingEvents = () => {
  const [events , setEvents] = useState([]);
  const [loading , setLoading] =useState(true)

  useEffect(()=>{
    const fetchEvent = async() =>{
      try{
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/api/student/events",{
          headers:{
            Authorization: `Bearer ${token}`,
          },
        });

        const data= await res.json();

        if(!res.ok){
          console.error("Fetch events failed:", data);
          return;
        }
        setEvents(data.events || []);
      }catch(err){
        console.error("Fetch error:", err);
      }finally{
        setLoading(false);
      }
    };
    fetchEvent();
  }, []);
  if(loading) return <p>Loading events....</p>
  return (
     <div className="events">
      <h3>Upcoming Events</h3>

      {events.length === 0 && <p>No upcoming events</p>}

      {events.map((e, i) => (
        <div key={i} className="event-row">
          <div className="date">{e.date}</div>
          <div className="details">
            <h4>{e.title}</h4>
            <p>{e.time} • {e.venue}</p>
          </div>
          <span className={`status ${e.status}`}>{e.status}</span>
        </div>
      ))}
    </div>
  )
}

export default StudentUpcomingEvents