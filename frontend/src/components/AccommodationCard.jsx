import { Link } from "react-router-dom";

const AccommodationCard = ({ accommodation, onBookNow }) => {
  if (!accommodation) return null;

  const {
    _id,
    name,
    description,
    location,
    price,
    gender,
    facilities = [],
    contact,
    isAvailable = true,
    image,
  } = accommodation;

  // Render facility icon helpers
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

  const getGenderBadgeClass = (genderVal) => {
    if (genderVal === "Male") return "badge-male";
    if (genderVal === "Female") return "badge-female";
    return "badge-any";
  };

  return (
    <div className={`accommodation-card ${!isAvailable ? "card-unavailable" : ""}`}>
      {image ? (
        <div className="card-image-wrapper">
          <img src={image} alt={name} className="card-image" />
        </div>
      ) : null}

      <div className="card-top-bar">
        <span className={`gender-badge ${getGenderBadgeClass(gender)}`}>
          {gender === "Male" && "👨 Male Only"}
          {gender === "Female" && "👩 Female Only"}
          {gender === "Any" && "👥 Any Gender"}
        </span>
        <div className="card-price">
          <span className="currency">Rs.</span>
          <span className="amount">{Number(price).toLocaleString()}</span>
          <span className="period">/mo</span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-title-row">
          <h3 className="card-title">{name}</h3>
        </div>

        {/* Clear Availability Badge */}
        <div className="card-availability-badge-wrapper">
          {isAvailable ? (
            <span className="availability-badge badge-available">
              <span className="status-dot dot-green"></span> Available
            </span>
          ) : (
            <span className="availability-badge badge-unavailable">
              <span className="status-dot dot-red"></span> Not Available
            </span>
          )}
        </div>

        <div className="card-location">
          <span className="location-pin">📍</span>
          <span>{location}</span>
        </div>

        <p className="card-description">
          {description.length > 110
            ? `${description.substring(0, 110)}...`
            : description}
        </p>

        {facilities.length > 0 && (
          <div className="card-facilities">
            {facilities.slice(0, 4).map((facility, index) => (
              <span key={index} className="facility-pill">
                <span className="facility-icon">{getFacilityIcon(facility)}</span>
                {facility}
              </span>
            ))}
            {facilities.length > 4 && (
              <span className="facility-more">
                +{facilities.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="card-contact">
          <span className="contact-label">Contact</span>
          <span className="contact-number">📞 {contact}</span>
        </div>

        <div className="card-actions-group">
          <Link
            to={`/accommodation/${_id}`}
            className="btn btn-outline btn-sm btn-details"
          >
            View Details
          </Link>

          {isAvailable ? (
            <button
              type="button"
              className="btn btn-primary btn-sm btn-book-now"
              onClick={() => onBookNow && onBookNow(accommodation)}
            >
              Book Now
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-disabled btn-sm"
              disabled
              title="This accommodation is currently occupied or unavailable"
            >
              Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccommodationCard;
