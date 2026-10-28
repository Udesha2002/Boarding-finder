import { useState } from "react";

const COMMON_FACILITIES = [
  "WiFi",
  "Parking",
  "Kitchen",
  "Attached Bathroom",
  "Electricity",
  "Water",
  "Laundry",
  "Study Area",
];

const FilterBar = ({ onApplyFilters, onClearFilters, initialFilters = {} }) => {
  const [search, setSearch] = useState(initialFilters.search || "");
  const [location, setLocation] = useState(initialFilters.location || "");
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || "");
  const [gender, setGender] = useState(initialFilters.gender || "All");
  const [selectedFacilities, setSelectedFacilities] = useState(
    initialFilters.facilities || []
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFacilityToggle = (facility) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters({
      search,
      location,
      minPrice,
      maxPrice,
      gender,
      facilities: selectedFacilities,
    });
  };

  const handleClear = () => {
    setSearch("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setGender("All");
    setSelectedFacilities([]);
    onClearFilters();
  };

  return (
    <form className="filter-card" onSubmit={handleSubmit}>
      {/* Primary Search Inputs Row */}
      <div className="filter-primary-row">
        <div className="filter-input-group flex-2">
          <label htmlFor="filter-search" className="filter-label">
            Search Keyword / Name
          </label>
          <div className="input-with-icon">
            <span className="input-icon">🔍</span>
            <input
              id="filter-search"
              type="text"
              className="form-control"
              placeholder="e.g. Royal Villa, Galle Road, Single Room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-input-group flex-2">
          <label htmlFor="filter-location" className="filter-label">
            Location
          </label>
          <div className="input-with-icon">
            <span className="input-icon">📍</span>
            <input
              id="filter-location"
              type="text"
              className="form-control"
              placeholder="e.g. Galle, Kandy, Colombo, Matara..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-input-group flex-1">
          <label htmlFor="filter-gender" className="filter-label">
            Gender Preference
          </label>
          <select
            id="filter-gender"
            className="form-control form-select"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male Only</option>
            <option value="Female">Female Only</option>
            <option value="Any">Any Gender</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Row */}
      <div className="filter-secondary-row">
        <div className="price-range-group">
          <label className="filter-label">Monthly Price Range (LKR)</label>
          <div className="price-inputs">
            <div className="input-with-icon">
              <span className="input-icon">Rs.</span>
              <input
                id="filter-minPrice"
                type="number"
                min="0"
                className="form-control"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <span className="range-separator">—</span>
            <div className="input-with-icon">
              <span className="input-icon">Rs.</span>
              <input
                id="filter-maxPrice"
                type="number"
                min="0"
                className="form-control"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="facilities-filter-group">
          <div className="facilities-header">
            <label className="filter-label">Filter by Facilities</label>
            <button
              type="button"
              className="btn-link-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Hide Facilities ▲" : "Show Facilities ▼"}
            </button>
          </div>

          <div
            className={`facilities-checkbox-grid ${
              showAdvanced ? "expanded" : "collapsed"
            }`}
          >
            {COMMON_FACILITIES.map((facility) => (
              <label key={facility} className="facility-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFacilities.includes(facility)}
                  onChange={() => handleFacilityToggle(facility)}
                />
                <span className="checkbox-custom"></span>
                <span className="facility-text">{facility}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="filter-actions">
        <button type="submit" className="btn btn-primary btn-apply">
          🔍 Apply Filters
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-clear"
          onClick={handleClear}
        >
          ✕ Clear Filters
        </button>
      </div>
    </form>
  );
};

export default FilterBar;
