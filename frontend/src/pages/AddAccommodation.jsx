import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { accommodationService } from "../services/accommodationService";
import Alert from "../components/Alert";

const AVAILABLE_FACILITIES = [
  "WiFi",
  "Parking",
  "Kitchen",
  "Attached Bathroom",
  "Electricity",
  "Water",
  "Laundry",
  "Study Area",
  "Air Conditioning",
  "Hot Water",
  "Security / CCTV",
  "Furnished",
];

const AddAccommodation = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    price: "",
    gender: "Any",
    facilities: ["WiFi", "Electricity", "Water"],
    contact: "",
    isAvailable: true,
  });

  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [customFacility, setCustomFacility] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds 10MB limit. Please select a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
        setImage(compressedDataUrl);
        setImagePreview(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage("");
    setImagePreview("");
    const fileInput = document.getElementById("prop-image");
    if (fileInput) fileInput.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const handleAddCustomFacility = (e) => {
    e.preventDefault();
    if (customFacility.trim() && !formData.facilities.includes(customFacility.trim())) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...prev.facilities, customFacility.trim()],
      }));
      setCustomFacility("");
    }
  };

  const validate = () => {
    if (!formData.name.trim()) return "Please provide the accommodation name.";
    if (!formData.description.trim()) return "Please enter a description.";
    if (!formData.location.trim()) return "Please provide the property location.";

    const numPrice = Number(formData.price);
    if (!formData.price || isNaN(numPrice) || numPrice <= 0) {
      return "Monthly price must be a valid positive number.";
    }

    if (!["Male", "Female", "Any"].includes(formData.gender)) {
      return "Please select a valid gender option.";
    }

    if (!formData.contact.trim()) {
      return "Please provide a contact phone number.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setLoading(true);
      await accommodationService.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        price: Number(formData.price),
        gender: formData.gender,
        facilities: formData.facilities,
        contact: formData.contact.trim(),
        isAvailable: formData.isAvailable,
        image: image || "",
      });

      setSuccess("Accommodation published successfully! Returning to dashboard...");
      setTimeout(() => {
        navigate("/owner");
      }, 1500);
    } catch (err) {
      console.error("Failed to add accommodation:", err);
      setError(
        err.response?.data?.message ||
          "Failed to add accommodation. Please check your inputs and try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-page-card">
        {/* Navigation & Header */}
        <div className="form-page-header">
          <Link to="/owner" className="btn-back-link">
            ← Back to Dashboard
          </Link>
          <h1 className="form-page-title">Add New Accommodation</h1>
          <p className="form-page-subtitle">
            Fill in the details below to list your boarding property for students
            and tenants.
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}
        {success && (
          <Alert type="success" message={success} />
        )}

        <form onSubmit={handleSubmit} className="property-form">
          {/* Section: Basic Details */}
          <div className="form-section">
            <h3 className="form-section-title">Property Details</h3>

            <div className="form-group">
              <label htmlFor="prop-name" className="form-label">
                Accommodation Title / Name *
              </label>
              <input
                id="prop-name"
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Royal Student Villa - Galle"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <span className="field-hint">
                A clear, catchy title describing the boarding place.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="prop-desc" className="form-label">
                Full Description *
              </label>
              <textarea
                id="prop-desc"
                name="description"
                rows="4"
                className="form-control"
                placeholder="Describe the rooms, environment, walking distance to university or bus stops, rules, and utilities..."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="prop-location" className="form-label">
                  Location (City / Town / Area) *
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">📍</span>
                  <input
                    id="prop-location"
                    type="text"
                    name="location"
                    className="form-control"
                    placeholder="e.g. Galle, Kandy, Colombo 07"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prop-price" className="form-label">
                  Monthly Rent (LKR) *
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">Rs.</span>
                  <input
                    id="prop-price"
                    type="number"
                    min="1"
                    name="price"
                    className="form-control"
                    placeholder="e.g. 15000"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <span className="field-hint">Price per month in Sri Lankan Rupees.</span>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="prop-gender" className="form-label">
                  Gender Preference *
                </label>
                <select
                  id="prop-gender"
                  name="gender"
                  className="form-control form-select"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="Male">👨 Male Only</option>
                  <option value="Female">👩 Female Only</option>
                  <option value="Any">👥 Any Gender</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="prop-contact" className="form-label">
                  Owner Contact Phone Number *
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">📞</span>
                  <input
                    id="prop-contact"
                    type="text"
                    name="contact"
                    className="form-control"
                    placeholder="e.g. 0771234567"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Boarding Image Upload */}
            <div className="form-group">
              <label htmlFor="prop-image" className="form-label">
                Boarding Photo (Optional)
              </label>
              <input
                id="prop-image"
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleImageChange}
              />
              <span className="field-hint">
                Select a photo from your computer (JPG, PNG, or WebP) to show students your boarding place.
              </span>
              {imagePreview && (
                <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <img
                    src={imagePreview}
                    alt="Boarding preview"
                    style={{
                      width: "120px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleRemoveImage}
                  >
                    Remove Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section: Facilities */}
          <div className="form-section">
            <h3 className="form-section-title">Facilities & Amenities</h3>
            <p className="form-section-subtitle">
              Select all amenities provided at this accommodation:
            </p>

            <div className="facilities-checkbox-container">
              {AVAILABLE_FACILITIES.map((facility) => (
                <label key={facility} className="facility-pill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                  />
                  <span className="facility-pill-box">
                    <span className="check-indicator">
                      {formData.facilities.includes(facility) ? "✓" : "+"}
                    </span>
                    {facility}
                  </span>
                </label>
              ))}
            </div>

            {/* Custom facility add */}
            <div className="add-custom-facility-row">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Add other facility (e.g. Balcony, Rooftop)..."
                value={customFacility}
                onChange={(e) => setCustomFacility(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddCustomFacility}
              >
                + Add Facility
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-row">
            <Link to="/owner" className="btn btn-secondary btn-lg">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? "Saving Accommodation..." : "Publish Accommodation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccommodation;