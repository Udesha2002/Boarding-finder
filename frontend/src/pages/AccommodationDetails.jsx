import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { accommodationService } from "../services/accommodationService";
import { bookingService } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import BookingConfirmModal from "../components/BookingConfirmModal";

const AccommodationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isOwner } = useAuth();

  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedContact, setCopiedContact] = useState(false);

  // Booking Modal State
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    loading: false,
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await accommodationService.getById(id);
        setAccommodation(data);
      } catch (err) {
        console.error("Failed to load accommodation details:", err);
        setError(
          err.response?.data?.message ||
            "Unable to find the requested accommodation. It may have been removed."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handleCopyContact = () => {
    if (accommodation?.contact) {
      navigator.clipboard.writeText(accommodation.contact);
      setCopiedContact(true);
      setTimeout(() => setCopiedContact(false), 2500);
    }
  };

  const handleOpenBooking = () => {
    setError("");
    setSuccess("");

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: location,
          notice: "Please sign in to submit a booking request for this boarding.",
        },
      });
      return;
    }

    if (isOwner) {
      setError("Property owners cannot submit booking requests. Please use a student/user account.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setBookingModal({
      isOpen: true,
      loading: false,
    });
  };

  const handleConfirmBooking = async () => {
    try {
      setBookingModal((prev) => ({ ...prev, loading: true }));
      await bookingService.create(accommodation._id);
      setSuccess("Booking request sent successfully. You can track your request under My Bookings.");
      setBookingModal({ isOpen: false, loading: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Booking submission error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit booking request. Please try again."
      );
      setBookingModal({ isOpen: false, loading: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getFacilityIcon = (facility) => {
    const lower = facility.toLowerCase();
    if (lower.includes("wifi")) return "📶";
    if (lower.includes("park")) return "🚗";
    if (lower.includes("kitchen")) return "🍳";
    if (lower.includes("bath")) return "🚿";
    if (lower.includes("elect")) return "⚡";
    if (lower.includes("water")) return "💧";
    if (lower.includes("laund")) return "🧺";
    if (lower.includes("study")) return "📚";
    return "✓";
  };

  return (
    <div className="details-page">
      <div className="details-container">
        {/* Back Navigation Bar */}
        <div className="details-nav-bar">
          <button
            type="button"
            className="btn btn-outline btn-sm btn-back"
            onClick={() => navigate(-1)}
          >
            ← Back to Listings
          </button>
          <span className="details-breadcrumbs">
            <Link to="/">Home</Link> / <Link to="/user">Boardings</Link> /{" "}
            <span>{accommodation?.name || "Details"}</span>
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="details-state-wrapper">
            <LoadingSpinner message="Loading accommodation details..." />
          </div>
        )}

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess("")} />
        )}

        {/* Error / Not Found State */}
        {error && !loading && !accommodation && (
          <div className="details-error-card">
            <div className="error-icon">⚠️</div>
            <h2>Accommodation Not Found</h2>
            <p className="error-message">{error}</p>
            <Link to="/user" className="btn btn-primary">
              Browse Available Boardings
            </Link>
          </div>
        )}

        {/* Details View */}
        {!loading && accommodation && (
          <div className="details-layout-grid">
            {/* Main Information Column */}
            <div className="details-main-column">
              <div className="details-header-card">
                <div className="details-badges-row">
                  <span
                    className={`gender-badge ${
                      accommodation.gender === "Male"
                        ? "badge-male"
                        : accommodation.gender === "Female"
                        ? "badge-female"
                        : "badge-any"
                    }`}
                  >
                    {accommodation.gender === "Male" && "👨 Male Students / Men Only"}
                    {accommodation.gender === "Female" && "👩 Female Students / Women Only"}
                    {accommodation.gender === "Any" && "👥 Open to Any Gender"}
                  </span>

                  {/* Availability Badge */}
                  {accommodation.isAvailable !== false ? (
                    <span className="availability-badge badge-available">
                      <span className="status-dot dot-green"></span> Available
                    </span>
                  ) : (
                    <span className="availability-badge badge-unavailable">
                      <span className="status-dot dot-red"></span> Not Available
                    </span>
                  )}

                  <span className="verified-badge">✓ Verified Listing</span>
                </div>

                <h1 className="details-title">{accommodation.name}</h1>

                <div className="details-location">
                  <span className="location-pin">📍</span>
                  <span className="location-text">{accommodation.location}</span>
                </div>

                {accommodation.image && (
                  <div className="details-image-wrapper" style={{ marginTop: "20px", borderRadius: "12px", overflow: "hidden", maxHeight: "380px" }}>
                    <img
                      src={accommodation.image}
                      alt={accommodation.name}
                      style={{ width: "100%", height: "100%", maxHeight: "380px", objectFit: "cover", display: "block" }}
                    />
                  </div>
                )}
              </div>

              {/* Description Card */}
              <div className="details-section-card">
                <h3 className="section-heading">About This Boarding</h3>
                <p className="details-full-description">
                  {accommodation.description}
                </p>
              </div>

              {/* Facilities Card */}
              <div className="details-section-card">
                <h3 className="section-heading">Included Facilities & Amenities</h3>
                {accommodation.facilities && accommodation.facilities.length > 0 ? (
                  <div className="details-facilities-grid">
                    {accommodation.facilities.map((facility, idx) => (
                      <div key={idx} className="details-facility-item">
                        <span className="facility-icon-large">
                          {getFacilityIcon(facility)}
                        </span>
                        <span className="facility-name">{facility}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">
                    No specific facilities listed. Please contact the owner for
                    more information.
                  </p>
                )}
              </div>
            </div>

            {/* Sticky Sidebar: Price, Booking Action & Owner Contact Card */}
            <aside className="details-sidebar">
              <div className="pricing-card">
                <div className="price-tag-large">
                  <span className="currency">Rs.</span>
                  <span className="amount">
                    {Number(accommodation.price).toLocaleString()}
                  </span>
                  <span className="period">/ month</span>
                </div>

                <div className="pricing-availability-row">
                  <span className="status-label">Availability:</span>
                  {accommodation.isAvailable !== false ? (
                    <span className="availability-pill pill-available">
                      🟢 Available
                    </span>
                  ) : (
                    <span className="availability-pill pill-unavailable">
                      🔴 Not Available
                    </span>
                  )}
                </div>

                <p className="pricing-note">
                  Rent includes standard amenities listed.
                </p>

                {/* Primary Booking Action */}
                <div className="details-booking-btn-box">
                  {accommodation.isAvailable !== false ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-block btn-lg btn-book-details"
                      onClick={handleOpenBooking}
                    >
                      📅 Book Now
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-disabled btn-block btn-lg"
                      disabled
                      title="This accommodation is currently not available for booking."
                    >
                      Not Available
                    </button>
                  )}
                </div>

                <hr className="sidebar-divider" />

                {/* Owner Information */}
                <div className="owner-profile-card">
                  <h4 className="owner-card-title">Property Owner</h4>
                  <div className="owner-identity">
                    <div className="owner-avatar">
                      {accommodation.owner?.name
                        ? accommodation.owner.name.charAt(0).toUpperCase()
                        : "O"}
                    </div>
                    <div className="owner-meta">
                      <span className="owner-name">
                        {accommodation.owner?.name || "Property Owner"}
                      </span>
                      {accommodation.owner?.email && (
                        <span className="owner-email">
                          ✉️ {accommodation.owner.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Direct Contact Action */}
                  <div className="owner-contact-box">
                    <span className="contact-box-label">Direct Phone Contact</span>
                    <div className="phone-number-display">
                      <span className="phone-icon">📞</span>
                      <a
                        href={`tel:${accommodation.contact}`}
                        className="phone-link"
                      >
                        {accommodation.contact}
                      </a>
                    </div>

                    <button
                      type="button"
                      className={`btn btn-block ${
                        copiedContact ? "btn-success" : "btn-outline"
                      }`}
                      onClick={handleCopyContact}
                    >
                      {copiedContact ? "✓ Number Copied!" : "📋 Copy Phone Number"}
                    </button>
                  </div>
                </div>

                <div className="safety-tips-box">
                  <span className="tips-icon">💡</span>
                  <p>
                    Tip: Submit a booking request to connect with the owner and reserve your boarding place.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      <BookingConfirmModal
        isOpen={bookingModal.isOpen}
        accommodation={accommodation}
        loading={bookingModal.loading}
        onConfirm={handleConfirmBooking}
        onClose={() => setBookingModal({ isOpen: false, loading: false })}
      />
    </div>
  );
};

export default AccommodationDetails;
