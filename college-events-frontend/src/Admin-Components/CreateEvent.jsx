import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Image,
  Tag,
  Send,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../Admin-Components/Layout/DashboardLayout";
import "../CSS/CreateEvent.css";

const categories = ["Tech", "Cultural", "Sports", "Career", "Other"];

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    venue: "",
    capacity: "",
    image: null,
  });

  const [preview, setPreview] = useState(null); // 🔥 NEW
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔥 IMAGE HANDLER (with preview)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));

    if (file) {
      setPreview(URL.createObjectURL(file)); // preview generate
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      const data = new FormData();

      // 🔥 clean append (loop)
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      const res = await fetch("http://localhost:3000/api/admin/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ DON'T set Content-Type manually
        },
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        console.log("Backend Error:", result);
        alert(result.message || "Event creation failed");
        return;
      }

      // ✅ Success
      setShowSuccess(true);

      setFormData({
        title: "",
        description: "",
        category: "",
        date: "",
        time: "",
        venue: "",
        capacity: "",
        image: null,
      });

      setPreview(null); // 🔥 reset preview

      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Server down or backend error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <form className="create-event" onSubmit={handleSubmit}>
        <div className="Event-header">
          <h1>Create New Event</h1>
          <p>Fill in the details to create a new event</p>
        </div>

        {showSuccess && (
          <div className="success-toast">
            <CheckCircle />
            <span>Event created successfully!</span>
          </div>
        )}

        <div className="form-card">
          <div className="field">
            <label><FileText /> Event Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="field">
            <label><FileText /> Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </div>

          <div className="field">
            <label><Tag /> Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="row">
            <div className="field">
              <label><Calendar /> Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="field">
              <label><Clock /> Time</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label><MapPin /> Venue</label>
              <input name="venue" value={formData.venue} onChange={handleChange} required />
            </div>
            <div className="field">
              <label><Users /> Capacity</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />
            </div>
          </div>

          <div className="field">
            <label><Image /> Event Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required />

            {/* 🔥 IMAGE PREVIEW */}
            {preview && (
              <img
                src={preview}
                alt="preview"
                style={{ width: "200px", marginTop: "10px", borderRadius: "8px" }}
              />
            )}
          </div>

          <div className="buttons">
            <button className="publish" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : <><Send /> Publish Event</>}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}