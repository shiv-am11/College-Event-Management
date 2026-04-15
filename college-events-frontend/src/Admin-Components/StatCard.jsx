import { useEffect, useState } from "react";
import "../CSS/StatCard.css";

export default function StatCard({ title, value, icon: Icon, trend }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = value / 40;

    const interval = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 30);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="stat-card">
      <div>
        <p className="stat-title">{title}</p>
        <h2>{count}</h2>

        {trend && (
          <p className={trend.isPositive ? "trend-up" : "trend-down"}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}% vs last month
          </p>
        )}
      </div>

      <div className="stat-icon">
        <Icon size={26} />
      </div>
    </div>
  );
}
