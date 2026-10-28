const Alert = ({ type = "error", message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert-box alert-${type}`} role="alert">
      <div className="alert-content">
        <span className="alert-icon">
          {type === "error" && "⚠️"}
          {type === "success" && "✓"}
          {type === "info" && "ℹ️"}
          {type === "warning" && "🔔"}
        </span>
        <span className="alert-message">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
