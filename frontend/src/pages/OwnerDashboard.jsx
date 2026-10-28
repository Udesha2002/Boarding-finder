import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { accommodationService } from "../services/accommodationService";
import { bookingService } from "../services/bookingService";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Booking Requests State
  const [bookingRequests, setBookingRequests] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingActionLoading, setBookingActionLoading] = useState(null);
  const [availabilityUpdating, setAvailabilityUpdating] = useState(null);

  // Modal state for delete confirmation
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    deleting: false,
  });

  const fetchMyAccommodations = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await accommodationService.getMyAccommodations();
      setAccommodations(data);
    } catch (err) {
      console.error("Failed to load owner accommodations:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load your accommodations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      setBookingsLoading(true);
      const data = await bookingService.getOwnerBookings();
      setBookingRequests(data);
    } catch (err) {
      console.error("Failed to load booking requests:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAccommodations();
    fetchBookingRequests();
  }, []);

  // Toggle Accommodation Availability
  const handleToggleAvailability = async (item) => {
    try {
      setAvailabilityUpdating(item._id);
      setError("");
      setSuccess("");
      const nextStatus = item.isAvailable === false ? true : false;
      const updated = await accommodationService.toggleAvailability(item._id, nextStatus);

      setAccommodations((prev) =>
        prev.map((acc) => (acc._id === item._id ? { ...acc, isAvailable: updated.isAvailable } : acc))
      );

      setSuccess(
        `"${item.name}" is now marked as ${updated.isAvailable ? "Available" : "Not Available"}.`
      );
    } catch (err) {
      console.error("Failed to toggle availability:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update accommodation availability. Please try again."
      );
    } finally {
      setAvailabilityUpdating(null);
    }
  };

  // Approve a Booking Request
  const handleApproveBooking = async (booking) => {
    try {
      setBookingActionLoading(booking._id);
      setError("");
      setSuccess("");
      await bookingService.approve(booking._id);

      setSuccess(
        `Booking request approved for "${booking.accommodation?.name || "Accommodation"}". The accommodation is now automatically marked as Not Available.`
      );

      // Refresh both bookings and accommodations so availability updates across dashboard
      await Promise.all([fetchBookingRequests(), fetchMyAccommodations()]);
    } catch (err) {
      console.error("Failed to approve booking:", err);
      setError(
        err.response?.data?.message ||
          "Failed to approve booking request. Please try again."
      );
    } finally {
      setBookingActionLoading(null);
    }
  };

  // Reject a Booking Request
  const handleRejectBooking = async (booking) => {
    try {
      setBookingActionLoading(booking._id);
      setError("");
      setSuccess("");
      await bookingService.reject(booking._id);

      setSuccess(
        `Booking request from ${booking.user?.name || "Student"} was rejected.`
      );

      await fetchBookingRequests();
    } catch (err) {
      console.error("Failed to reject booking:", err);
      setError(
        err.response?.data?.message ||
          "Failed to reject booking request. Please try again."
      );
    } finally {
      setBookingActionLoading(null);
    }
  };

  const handleOpenDelete = (item) => {
    setDeleteModal({
      isOpen: true,
      item,
      deleting: false,
    });
  };

  const handleCloseDelete = () => {
    setDeleteModal({
      isOpen: false,
      item: null,
      deleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return;

    try {
      setDeleteModal((prev) => ({ ...prev, deleting: true }));
      await accommodationService.delete(deleteModal.item._id);
      setSuccess(`"${deleteModal.item.name}" deleted successfully.`);
      handleCloseDelete();
      // Refresh listings & bookings
      fetchMyAccommodations();
      fetchBookingRequests();
    } catch (err) {
      console.error("Failed to delete accommodation:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete accommodation. Please try again."
      );
      handleCloseDelete();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Compute statistics
  const totalListings = accommodations.length;
  const pendingRequestsCount = bookingRequests.filter(b => b.status === "pending").length;
  const totalRequestsCount = bookingRequests.length;
  const averagePrice =
    totalListings > 0
      ? Math.round(
          accommodations.reduce((sum, item) => sum + (Number(item.price) || 0), 0) /
            totalListings
        )
      : 0;

  return (
    <div className="owner-dashboard-page">
      <div className="section-container">
        {/* Welcome Header */}
        <div className="dashboard-welcome-banner">
          <div className="welcome-text-group">
            <span className="welcome-eyebrow">Property Owner Portal</span>
            <h1 className="welcome-title">
              Welcome back, {user?.name || "Owner"} 👋
            </h1>
            <p className="welcome-desc">
              Manage your boarding accommodations, view analytics, and publish
              new listings.
            </p>
          </div>

          <div className="welcome-actions">
            <Link to="/owner/add" className="btn btn-primary btn-add-listing">
              ➕ Add Accommodation
            </Link>
            <button
              type="button"
              className="btn btn-outline btn-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}
        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess("")}
          />
        )}

        {/* Dashboard Statistics */}
        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon icon-blue">📋</div>
            <div className="stat-card-content">
              <span className="stat-card-label">Total Listings</span>
              <h3 className="stat-card-value">{totalListings}</h3>
              <span className="stat-card-hint">Active properties listed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon icon-orange">📬</div>
            <div className="stat-card-content">
              <span className="stat-card-label">Booking Requests</span>
              <h3 className="stat-card-value">{totalRequestsCount}</h3>
              <span className="stat-card-hint">{pendingRequestsCount} pending approval</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon icon-green">💰</div>
            <div className="stat-card-content">
              <span className="stat-card-label">Average Monthly Rent</span>
              <h3 className="stat-card-value">
                Rs. {averagePrice.toLocaleString()}
              </h3>
              <span className="stat-card-hint">Across your listings</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon icon-purple">👥</div>
            <div className="stat-card-content">
              <span className="stat-card-label">Account Status</span>
              <h3 className="stat-card-value">Verified</h3>
              <span className="stat-card-hint">Full management access</span>
            </div>
          </div>
        </div>

        {/* Booking Requests Section */}
        <div className="dashboard-content-header" style={{ marginTop: "2.5rem" }}>
          <div>
            <h2 className="section-title">Booking Requests</h2>
            <p className="section-subtitle">
              Review and manage incoming booking requests from university students.
            </p>
          </div>
          {pendingRequestsCount > 0 && (
            <span className="badge-pending-count">
              {pendingRequestsCount} Pending
            </span>
          )}
        </div>

        {/* Booking Requests State */}
        {bookingsLoading ? (
          <div className="dashboard-state-wrapper">
            <LoadingSpinner message="Loading booking requests..." />
          </div>
        ) : bookingRequests.length === 0 ? (
          <div className="owner-empty-card" style={{ marginBottom: "2.5rem" }}>
            <div className="empty-icon">📬</div>
            <h3>No booking requests yet</h3>
            <p>
              When students request to book your accommodations, their requests will appear here for your review and approval.
            </p>
          </div>
        ) : (
          <div className="booking-requests-container" style={{ marginBottom: "2.5rem" }}>
            <div className="booking-requests-table-wrapper">
              <table className="booking-requests-table">
                <thead>
                  <tr>
                    <th>Accommodation</th>
                    <th>Student Name</th>
                    <th>Student Email</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingRequests.map((req) => (
                    <tr key={req._id} className={`booking-row-${req.status}`}>
                      <td className="cell-accommodation">
                        <strong>{req.accommodation?.name || "Deleted Listing"}</strong>
                        {req.accommodation?.location && (
                          <div className="table-subtext">📍 {req.accommodation.location}</div>
                        )}
                      </td>
                      <td className="cell-user-name">
                        <span className="user-icon">👤</span> {req.user?.name || "Student"}
                      </td>
                      <td className="cell-user-email">
                        <a href={`mailto:${req.user?.email}`} className="email-link">
                          {req.user?.email || "N/A"}
                        </a>
                      </td>
                      <td className="cell-date">
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td className="cell-status">
                        <span
                          className={`booking-status-badge status-${req.status}`}
                        >
                          {req.status === "approved"
                            ? "Approved"
                            : req.status === "rejected"
                            ? "Rejected"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="cell-actions">
                        {req.status === "pending" ? (
                          <div className="booking-action-btn-group">
                            <button
                              type="button"
                              className="btn btn-sm btn-approve"
                              onClick={() => handleApproveBooking(req)}
                              disabled={bookingActionLoading === req._id}
                              title="Approve booking and mark accommodation as Not Available"
                            >
                              {bookingActionLoading === req._id ? "..." : "Approve"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-reject"
                              onClick={() => handleRejectBooking(req)}
                              disabled={bookingActionLoading === req._id}
                              title="Reject booking request"
                            >
                              {bookingActionLoading === req._id ? "..." : "Reject"}
                            </button>
                          </div>
                        ) : req.status === "approved" ? (
                          <span className="action-resolved-text text-success">
                            ✓ Approved
                          </span>
                        ) : (
                          <span className="action-resolved-text text-danger">
                            ✕ Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Manage Listings Section */}
        <div className="dashboard-content-header">
          <div>
            <h2 className="section-title">My Accommodations</h2>
            <p className="section-subtitle">
              All properties registered under your owner account.
            </p>
          </div>

          <Link to="/owner/add" className="btn btn-outline btn-sm">
            + New Listing
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="dashboard-state-wrapper">
            <LoadingSpinner message="Loading your accommodations..." />
          </div>
        )}

        {/* Empty State */}
        {!loading && accommodations.length === 0 && (
          <div className="owner-empty-card">
            <div className="empty-icon">🏠</div>
            <h3>You have not added any accommodations yet.</h3>
            <p>
              Start publishing your boarding places to reach university students
              and tenants looking for rooms.
            </p>
            <Link to="/owner/add" className="btn btn-primary btn-lg">
              Add Your First Accommodation
            </Link>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && accommodations.length > 0 && (
          <div className="owner-listings-grid">
            {accommodations.map((item) => (
              <div key={item._id} className="owner-listing-card">
                <div className="listing-card-header">
                  <div>
                    <h3 className="listing-title">{item.name}</h3>
                    <div className="listing-location">
                      <span>📍</span> {item.location}
                    </div>
                  </div>

                  <div className="listing-price-badge">
                    Rs. {Number(item.price).toLocaleString()}
                    <span className="sub">/mo</span>
                  </div>
                </div>

                <p className="listing-desc">{item.description}</p>

                <div className="listing-meta-row">
                  <span className="meta-pill">
                    <strong>Gender:</strong> {item.gender}
                  </span>
                  <span className="meta-pill">
                    <strong>Contact:</strong> {item.contact}
                  </span>
                </div>

                {/* Owner Availability Switch */}
                <div className="listing-availability-box">
                  <div className="availability-info">
                    <span className="availability-label">Availability:</span>
                    <span
                      className={`availability-pill ${
                        item.isAvailable !== false
                          ? "pill-available"
                          : "pill-unavailable"
                      }`}
                    >
                      {item.isAvailable !== false ? "Available" : "Not Available"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`btn-availability-toggle ${
                      item.isAvailable !== false
                        ? "toggle-on"
                        : "toggle-off"
                    }`}
                    onClick={() => handleToggleAvailability(item)}
                    disabled={availabilityUpdating === item._id}
                    title={
                      item.isAvailable !== false
                        ? "Click to switch to Not Available"
                        : "Click to switch to Available"
                    }
                  >
                    {availabilityUpdating === item._id
                      ? "Updating..."
                      : item.isAvailable !== false
                      ? "[ ON ] Available"
                      : "[ OFF ] Not Available"}
                  </button>
                </div>

                {item.facilities && item.facilities.length > 0 && (
                  <div className="listing-facilities-row">
                    {item.facilities.map((fac, idx) => (
                      <span key={idx} className="facility-pill-sm">
                        {fac}
                      </span>
                    ))}
                  </div>
                )}

                <div className="listing-card-actions">
                  <Link
                    to={`/accommodation/${item._id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View Public Page
                  </Link>

                  <div className="management-buttons">
                    <Link
                      to={`/owner/edit/${item._id}`}
                      className="btn btn-edit btn-sm"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleOpenDelete(item)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="modal-backdrop" onClick={handleCloseDelete}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-icon-warning">⚠️</div>
            <h3 className="modal-title">Confirm Deletion</h3>
            <p className="modal-message">
              Are you sure you want to delete this accommodation?
            </p>
            <p className="modal-item-name">
              <strong>"{deleteModal.item?.name}"</strong>
            </p>
            <p className="modal-subtext">
              This action cannot be undone. The listing will be permanently
              removed from the database.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseDelete}
                disabled={deleteModal.deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleteModal.deleting}
              >
                {deleteModal.deleting ? "Deleting..." : "Yes, Delete Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;