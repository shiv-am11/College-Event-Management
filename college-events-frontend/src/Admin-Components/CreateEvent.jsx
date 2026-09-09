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
  GraduationCap,
} from "lucide-react";

import DashboardLayout from "../Admin-Components/Layout/DashboardLayout";
import "../CSS/CreateEvent.css";

const categories = [
  "Tech",
  "Cultural",
  "Sports",
  "Career",
  "Other",
];

const courses = [
  "MCA",
  "BCA",
  "BBA",
  "BA ECO",
];

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    course: "",
    date: "",
    time: "",
    venue: "",
    capacity: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE IMAGE
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  // ==========================================
  // SUBMIT FORM
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      // ==========================================
      // FORM DATA
      // ==========================================

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      // ==========================================
      // API REQUEST
      // ==========================================

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/events`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: data,
        }
      );

      const result = await res.json();

      // ==========================================
      // ERROR
      // ==========================================

      if (!res.ok) {
        console.log("Backend Error:", result);

        alert(
          result.message ||
            "Event creation failed"
        );

        return;
      }

      // ==========================================
      // SUCCESS
      // ==========================================

      setShowSuccess(true);

      setFormData({
        title: "",
        description: "",
        category: "",
        course: "",
        date: "",
        time: "",
        venue: "",
        capacity: "",
        image: null,
      });

      setPreview(null);

      // Hide success message
      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);

    } catch (err) {
      console.error("Fetch Error:", err);

      alert(
        "Server down or backend error"
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>

      <form
        className="create-event"
        onSubmit={handleSubmit}
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="Cr-Event-header">

          <h1>
            Create New Event
          </h1>

          <p>
            Fill in the details to create a new event
          </p>

        </div>


        {/* ==========================================
            SUCCESS MESSAGE
        ========================================== */}

        {showSuccess && (
          <div className="success-toast">

            <CheckCircle color="#6467f2" />

            <span>
              Event created successfully!
            </span>

          </div>
        )}


        <div className="form-card">


          {/* ==========================================
              EVENT TITLE
          ========================================== */}

          <div className="field">

            <label>
              <FileText />
              Event Title
            </label>

            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

          </div>


          {/* ==========================================
              DESCRIPTION
          ========================================== */}

          <div className="field">

            <label>
              <FileText />
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />

          </div>


          {/* ==========================================
              CATEGORY
          ========================================== */}

          <div className="field">

            <label>
              <Tag />
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >

              <option value="">
                Select category
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}

            </select>

          </div>


          {/* ==========================================
              COURSE
          ========================================== */}

          <div className="field">

            <label>
              <GraduationCap />
              Course
            </label>

            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
            >

              <option value="">
                Select course
              </option>

              {courses.map((course) => (
                <option
                  key={course}
                  value={course}
                >
                  {course}
                </option>
              ))}

            </select>

          </div>


          {/* ==========================================
              DATE & TIME
          ========================================== */}

          <div className="row">

            {/* DATE */}

            <div className="field">

              <label>
                <Calendar />
                Date
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

            </div>


            {/* TIME */}

            <div className="field">

              <label>
                <Clock />
                Time
              </label>

              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* ==========================================
              VENUE & CAPACITY
          ========================================== */}

          <div className="row">

            {/* VENUE */}

            <div className="field">

              <label>
                <MapPin />
                Venue
              </label>

              <input
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
              />

            </div>


            {/* CAPACITY */}

            <div className="field">

              <label>
                <Users />
                Capacity
              </label>

              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                required
              />

            </div>

          </div>


          {/* ==========================================
              IMAGE
          ========================================== */}

          <div className="field">

            <label>
              <Image />
              Event Image
            </label>

            <input
              style={{ height: "100px" }}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />

            {preview && (
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "200px",
                  marginTop: "10px",
                  borderRadius: "8px",
                }}
              />
            )}

          </div>


          {/* ==========================================
              BUTTON
          ========================================== */}

          <div className="buttons">

            <button
              className="EC-publish"
              type="submit"
              disabled={isSubmitting}
            >

              {isSubmitting ? (
                "Publishing..."
              ) : (
                <>
                  <Send />
                  Publish Event
                </>
              )}

            </button>

          </div>

        </div>

      </form>

    </DashboardLayout>
  );
}
