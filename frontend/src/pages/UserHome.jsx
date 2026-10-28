import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { accommodationService } from "../services/accommodationService";
import { bookingService } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import AccommodationCard from "../components/AccommodationCard";
import FilterBar from "../components/FilterBar";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import BookingConfirmModal from "../components/BookingConfirmModal";

const UserHome = () => {
  const { isAuthenticated, isOwner, user } = useAuth();
  const navigate = useNavigate();

  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState({});

  // Booking Modal State
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    item: null,
    loading: false,
  });

  const fetchAccommodations = useCallback(async (currentFilters = {}) => {
    try {
      setLoading(true);
      setError("");
      const data = await accommodationService.getAll(currentFilters);
      setAccommodations(data);
    } catch (err) {
      console.error("Failed to load accommodations:", err);
      setError(
        err.response?.data?.message ||
          "Could not retrieve accommodations. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccommodations(filters);
  }, [fetchAccommodations, filters]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  // Open booking confirmation modal
  const handleOpenBookNow = (accommodation) => {
    setError("");
    setSuccess("");

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: { pathname: "/user" },
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
      item: accommodation,
      loading: false,
    });
  };

  const handleCloseBookingModal = () => {
    setBookingModal({
      isOpen: false,
      item: null,
      loading: false,
    });
  };

  // Submit confirmed booking
  const handleConfirmBooking = async () => {
    if (!bookingModal.item) return;

    try {
      setBookingModal((prev) => ({ ...prev, loading: true }));
      const res = await bookingService.create(bookingModal.item._id);

      setSuccess(
        `Booking request sent successfully for "${bookingModal.item.name}". You can track your request under My Bookings.`
      );
      handleCloseBookingModal();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to submit booking:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit booking request. Please try again."
      );
      handleCloseBookingModal();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="user-home-page">
      {/* Hero Header Area */}
      <section className="user-hero-header">
        <div className="section-container">
          <div className="hero-content text-center">
            <span className="hero-pill">🎓 Student & Tenant Search</span>
            <h1 className="hero-heading">Find Your Perfect Boarding</h1>
            <p className="hero-lead">
              Discover comfortable and affordable boarding accommodation in your
              preferred location.
            </p>
          </div>

          {/* Interactive Search & Filter Card */}
          <FilterBar
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            initialFilters={filters}
          />
        </div>
      </section>

      {/* Accommodations Grid Section */}
      <section className="accommodations-section">
        <div className="section-container">
          <div className="results-header">
            <div className="results-count">
              {!loading && (
                <h2>
                  Boarding Accommodations{" "}
                  <span className="count-badge">{accommodations.length}</span>
                </h2>
              )}
            </div>

            <div className="results-header-actions">
              {isAuthenticated && !isOwner && (
                <Link to="/user/bookings" className="btn btn-outline btn-sm btn-my-bookings-link">
                  📋 View My Bookings
                </Link>
              )}

              {Object.keys(filters).length > 0 && (
                <div className="active-filters-notice">
                  <span>Filtered</span>
                  <button
                    type="button"
                    className="btn-clear-inline"
                    onClick={handleClearFilters}
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError("")}
            />
          )}

          {success && (
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess("")}
            />
          )}

          {/* Loading State */}
          {loading && (
            <div className="state-container">
              <LoadingSpinner message="Loading accommodations..." />
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && accommodations.length === 0 && (
            <div className="empty-state-card">
              <div className="empty-icon">🔍</div>
              <h3 className="empty-title">No boarding accommodations found</h3>
              <p className="empty-desc">
                Try changing your search or filters to discover available
                boarding places in other areas or price ranges.
              </p>
              {Object.keys(filters).length > 0 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Results Grid */}
          {!loading && accommodations.length > 0 && (
            <div className="accommodations-grid">
              {accommodations.map((accommodation) => (
                <AccommodationCard
                  key={accommodation._id}
                  accommodation={accommodation}
                  onBookNow={handleOpenBookNow}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Confirmation Modal */}
      <BookingConfirmModal
        isOpen={bookingModal.isOpen}
        accommodation={bookingModal.item}
        loading={bookingModal.loading}
        onConfirm={handleConfirmBooking}
        onClose={handleCloseBookingModal}
      />
    </div>
  );
};

export default UserHome;