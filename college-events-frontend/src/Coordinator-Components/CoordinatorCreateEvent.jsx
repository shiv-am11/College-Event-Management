
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Image as ImageIcon,
  Tag,
  Send,
  MessageCircle,
} from "lucide-react";

import DashboardLayout from "../Coordinator-Components/layout/CoordinatorDashLayout";
import { notify, LoadingOverlay } from "../Components/ToastHost";
import "../CSS/CreateEvent.css";

const categories = ["Tech", "Cultural", "Sports", "Career", "Other"];

const initialFormData = {
  title: "",
  description: "",
  category: "",
  instructions: "",
  date: "",
  startTime: "",
  endTime: "",
  venue: "",
  capacity: "",
  whatsappLink: "",
  image: null,
};

const getLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function CoordinatorCreateEvent() {
  const [formData, setFormData] = useState(initialFormData);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (file && !file.type.startsWith("image/")) {
      notify(
        "Please select a valid image file.",
        "warning",
        "Invalid File"
      );
      e.target.value = "";
      return;
    }

    setFormData((previous) => ({
      ...previous,
      image: file,
    }));

    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const resetForm = () => {
    setFormData({ ...initialFormData });
    setPreview(null);

    const fileInput = document.getElementById("coordinator-event-image");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const requiredFields = [
      ["title", "Event title"],
      ["description", "Description"],
      ["category", "Category"],
      ["instructions", "Instructions"],
      ["date", "Date"],
      ["startTime", "Start time"],
      ["endTime", "End time"],
      ["venue", "Venue"],
      ["capacity", "Capacity"],
    ];

    for (const [key, label] of requiredFields) {
      if (!String(formData[key] ?? "").trim()) {
        notify(`${label} is required.`, "warning", "Missing Information");
        return;
      }
    }

    if (!formData.image) {
      notify(
        "Please select an event image.",
        "warning",
        "Image Required"
      );
      return;
    }

    if (formData.date < getLocalDate()) {
      notify(
        "Please choose today or a future date.",
        "warning",
        "Invalid Date"
      );
      return;
    }

    if (formData.endTime <= formData.startTime) {
      notify(
        "End time must be later than start time.",
        "warning",
        "Invalid Event Time"
      );
      return;
    }

    const capacity = Number(formData.capacity);

    if (!Number.isInteger(capacity) || capacity < 1) {
      notify(
        "Capacity must be a positive whole number.",
        "warning",
        "Invalid Capacity"
      );
      return;
    }

    const whatsappLink = formData.whatsappLink.trim();

    if (whatsappLink) {
      try {
        const parsedLink = new URL(whatsappLink);

        if (
          parsedLink.protocol !== "https:" ||
          parsedLink.hostname.toLowerCase() !== "chat.whatsapp.com"
        ) {
          throw new Error("Invalid WhatsApp invitation URL");
        }
      } catch {
        notify(
          "Enter a valid WhatsApp invitation link starting with https://chat.whatsapp.com/",
          "warning",
          "Invalid WhatsApp Link"
        );
        return;
      }
    }

    const token = localStorage.getItem("token");

    if (!token) {
      notify(
        "Please log in before creating an event.",
        "warning",
        "Login Required"
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const data = new FormData();

      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("category", formData.category);
      data.append("instructions", formData.instructions.trim());
      data.append("date", formData.date);
      data.append("startTime", formData.startTime);
      data.append("endTime", formData.endTime);

      // Keep the legacy time field for existing backend compatibility.
      data.append("time", formData.startTime);

      data.append("venue", formData.venue.trim());
      data.append("capacity", String(capacity));

      if (whatsappLink) {
        data.append("whatsappLink", whatsappLink);
      }

      data.append("image", formData.image);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/coordinator/createEvent-coordinator`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 409) {
          notify(
            result.message ||
              "This venue is already booked during the selected time. Please choose another venue or time.",
            "error",
            "Venue Conflict"
          );
        } else {
          notify(
            result.message || "Event creation failed. Please try again.",
            "error",
            "Event Creation Failed"
          );
        }

        // Preserve entered values so the coordinator can fix the issue.
        return;
      }

      notify(
        "Your event has been created successfully.",
        "success",
        "Event Created"
      );

      resetForm();
    } catch (error) {
      console.error("Coordinator event creation error:", error);

      notify(
        "Unable to connect to the server. Your form data has been preserved.",
        "error",
        "Server Error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {isSubmitting && (
        <LoadingOverlay message="Publishing your event..." />
      )}

      <form className="create-event" onSubmit={handleSubmit}>
        <div className="Cr-Event-header">
          <h1>Create New Event</h1>
          <p>Fill in the details to create a new event</p>
        </div>

        <div className="form-card">
          <div className="field">
            <label>
              <FileText /> Event Title
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="field">
            <label>
              <FileText /> Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              required
            />
          </div>

          <div className="field">
            <label>
              <Tag /> Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>
              <FileText /> Instructions
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Enter instructions for students..."
              required
            />
          </div>

          <div className="field">
            <label>
              <MessageCircle color="#25D366" /> WhatsApp Group Link
            </label>
            <input
              type="url"
              name="whatsappLink"
              value={formData.whatsappLink}
              onChange={handleChange}
              placeholder="https://chat.whatsapp.com/..."
            />
          </div>

          <div className="row">
            <div className="field">
              <label>
                <Calendar /> Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getLocalDate()}
                required
              />
            </div>

            <div className="field">
              <label>
                <Clock /> Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>
                <Clock /> End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                min={formData.startTime || undefined}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>
                <MapPin /> Venue
              </label>
              <input
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Enter venue"
                required
              />
            </div>

            <div className="field">
              <label>
                <Users /> Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                step="1"
                placeholder="Maximum students"
                required
              />
            </div>
          </div>

          <div className="field">
            <label>
              <ImageIcon /> Event Image
            </label>
            <input
              id="coordinator-event-image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />

            {preview && (
              <img
                src={preview}
                alt="Selected event preview"
                style={{
                  display: "block",
                  width: "200px",
                  maxWidth: "100%",
                  marginTop: "12px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            )}
          </div>

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
                  <Send /> Publish Event
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
