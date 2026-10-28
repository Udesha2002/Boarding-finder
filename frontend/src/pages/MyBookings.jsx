import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to load user bookings:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load your bookings. Please check your network and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="my-bookings-page">
      <div className="section-container">
        {/* Page Header */}
        <div className="bookings-page-header">
          <div>
            <div className="breadcrumb-nav">
              <Link to="/user" className="breadcrumb-link">
                ← Back to Boardings
              </Link>
            </div>
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">
              Track the status of all your requested boarding places and accommodations.
            </p>
          </div>

          <Link to="/user" className="btn btn-outline btn-sm">
            🔍 Browse More Accommodations
          </Link>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="dashboard-state-wrapper">
            <LoadingSpinner message="Loading your bookings..." />
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="owner-empty-card">
            <div className="empty-icon">📋</div>
            <h3>No Bookings Found</h3>
            <p>
              You haven't requested any boarding accommodations yet. Browse our verified listings and click "Book Now" on available places to send a request to the owner.
            </p>
            <Link to="/user" className="btn btn-primary btn-lg">
              Explore Available Boardings
            </Link>
          </div>
        )}

        {/* Bookings List */}
        {!loading && bookings.length > 0 && (
          <div className="my-bookings-list">
            <div className="my-bookings-stats-bar">
              <span>
                Total Requests: <strong>{bookings.length}</strong>
              </span>
              <span>
                Pending:{" "}
                <strong className="text-warning">
                  {bookings.filter((b) => b.status === "pending").length}
                </strong>
              </span>
              <span>
                Approved:{" "}
                <strong className="text-success">
                  {bookings.filter((b) => b.status === "approved").length}
                </strong>
              </span>
              <span>
                Rejected:{" "}
                <strong className="text-danger">
                  {bookings.filter((b) => b.status === "rejected").length}
                </strong>
              </span>
            </div>

            <div className="my-bookings-cards-grid">
              {bookings.map((booking) => {
                const accom = booking.accommodation;
                const formattedDate = booking.createdAt
                  ? new Date(booking.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A";

                return (
                  <div
                    key={booking._id}
                    className={`my-booking-card card-status-${booking.status}`}
                  >
                    <div className="booking-card-top">
                      <div className="booking-status-tag-wrapper">
                        <span
                          className={`booking-status-badge status-${booking.status}`}
                        >
                          {booking.status === "approved"
                            ? "Approved"
                            : booking.status === "rejected"
                            ? "Rejected"
                            : "Pending"}
                        </span>
                      </div>
                      <div className="booking-date-text">
                        Requested: {formattedDate}
                      </div>
                    </div>

                    <div className="booking-card-body">
                      <h3 className="booking-accom-title">
                        {accom?.name || "Accommodation Listing"}
                      </h3>

                      <div className="booking-meta-row">
                        <span className="booking-meta-item">
                          📍 {accom?.location || "Location not specified"}
                        </span>
                        {accom?.gender && (
                          <span className="booking-meta-item">
                            👤 {accom.gender}
                          </span>
                        )}
                      </div>

                      {accom?.price && (
                        <div className="booking-price-row">
                          <span className="price-label">Monthly Rent:</span>
                          <span className="price-value">
                            Rs. {Number(accom.price).toLocaleString()}{" "}
                            <small>/mo</small>
                          </span>
                        </div>
                      )}

                      {/* Status explanation notice */}
                      <div className={`status-notice-box notice-${booking.status}`}>
                        {booking.status === "pending" && (
                          <span>
                            ⏳ <strong>Pending Owner Review:</strong> Your request has been sent to the property owner. You will see their decision here once reviewed.
                          </span>
                        )}
                        {booking.status === "approved" && (
                          <span>
                            🎉 <strong>Booking Approved!</strong> The owner accepted your request. Please contact the owner at{" "}
                            <strong>{accom?.contact || "the provided phone number"}</strong> to finalize your move-in.
                          </span>
                        )}
                        {booking.status === "rejected" && (
                          <span>
                            ✕ <strong>Request Rejected:</strong> The owner was unable to accommodate your request at this time. Feel free to browse other available listings.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="booking-card-footer">
                      {accom?._id ? (
                        <Link
                          to={`/accommodation/${accom._id}`}
                          className="btn btn-outline btn-sm btn-block"
                        >
                          View Boarding Details →
                        </Link>
                      ) : (
                        <span className="text-muted text-sm">
                          Listing details no longer available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
