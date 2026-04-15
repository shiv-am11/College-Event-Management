import "./StudentStatCard.css"
const StudentStatCard = ({title , value ,subtext ,icon: Icon ,}) => {
  return (
     <div className="stat-card">
      <div className="info">
        <p className="stat-title">{title}</p>
        <h2>{value}</h2>
        <small>{subtext}</small>
      </div>
      <div className="stat-icon">
        {Icon}
    </div>
    </div>
  )}


export default StudentStatCard;