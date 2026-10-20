import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import "../CSS/Toast.css";

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export function notify(message, type = "success", title) {
  window.dispatchEvent(
    new CustomEvent("campushub-toast", {
      detail: {
        id: `${Date.now()}-${Math.random()}`,
        message,
        type,
        title:
          title ||
          ({
            success: "Success",
            error: "Something went wrong",
            info: "Information",
            warning: "Please note",
          }[type] || "Notification"),
      },
    })
  );
}

export function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const toast = event.detail;

      setToasts((previous) => [...previous, toast]);

      window.setTimeout(() => {
        setToasts((previous) =>
          previous.filter((item) => item.id !== toast.id)
        );
      }, 4000);
    };

    window.addEventListener("campushub-toast", handleToast);

    return () =>
      window.removeEventListener("campushub-toast", handleToast);
  }, []);

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;

        return (
          <div
            key={toast.id}
            className={`campus-toast toast-${toast.type}`}
            role="status"
          >
            <div className="toast-icon">
              <Icon size={24} />
            </div>

            <div className="toast-content">
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </div>

            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss notification"
              onClick={() =>
                setToasts((previous) =>
                  previous.filter((item) => item.id !== toast.id)
                )
              }
            >
              <X size={20} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function LoadingOverlay({ message = "Please wait..." }) {
  return (
    <div className="campus-loading-overlay" role="status" aria-live="polite">
      <div className="campus-loading-card">
        <div className="campus-spinner" />
        <h2>CampusHub</h2>
        <p>{message}</p>
        <span>Please wait while we complete your request.</span>
      </div>
    </div>
  );
}
