const BookingConfirmModal = ({
  isOpen,
  accommodation,
  loading,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !accommodation) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card modal-booking-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-icon-booking">📅</div>
        <h3 className="modal-title">Confirm Booking Request</h3>
        <p className="modal-message">
          Are you sure you want to request this boarding?
        </p>

        <div className="modal-booking-summary">
          <div className="summary-row">
            <span className="summary-label">Accommodation:</span>
            <span className="summary-value"><strong>{accommodation.name}</strong></span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Location:</span>
            <span className="summary-value">📍 {accommodation.location}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Monthly Rent:</span>
            <span className="summary-value price-text">
              Rs. {Number(accommodation.price).toLocaleString()} / mo
            </span>
          </div>
          {accommodation.gender && (
            <div className="summary-row">
              <span className="summary-label">Preference:</span>
              <span className="summary-value">{accommodation.gender}</span>
            </div>
          )}
        </div>

        <p className="modal-subtext">
          Your request will be submitted with <strong>Pending</strong> status. The property owner will review and approve or reject your booking.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-confirm-booking"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Sending Request..." : "Yes, Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmModal;
