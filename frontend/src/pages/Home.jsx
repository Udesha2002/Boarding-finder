import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated, isOwner } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <span className="badge-sparkle">✨</span>
            <span>Sri Lanka's Modern Accommodation Platform</span>
          </div>

          <h1 className="hero-title">
            Find Your <span className="text-gradient">Perfect Boarding</span>
          </h1>

          <p className="hero-subtitle">
            Find a comfortable place to stay. Discover comfortable and
            affordable boarding accommodation in your preferred location. We
            connect university students and tenants with verified property
            owners.
          </p>

          <div className="hero-cta-group">
            <Link
              to={isAuthenticated && isOwner ? "/owner" : "/user"}
              className="btn btn-primary btn-lg"
            >
              🔍 Find a Boarding
            </Link>
            <Link
              to={
                isAuthenticated
                  ? isOwner
                    ? "/owner/add"
                    : "/user"
                  : "/register"
              }
              className="btn btn-outline btn-lg"
            >
              🏢 List Your Property
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Verified Owners</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">LKR</span>
              <span className="stat-label">Affordable Student Rates</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">Direct</span>
              <span className="stat-label">Owner Contact</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Sides Section: For Users vs For Owners */}
      <section className="two-sides-section">
        <div className="section-container">
          <div className="section-header text-center">
            <h2 className="section-title">Built for Students & Property Owners</h2>
            <p className="section-subtitle">
              Whether you are looking for a room near your campus or managing
              multiple boarding properties, Boarding Finder has you covered.
            </p>
          </div>

          <div className="two-sides-grid">
            {/* For Students / Users */}
            <div className="side-card student-card">
              <div className="side-icon-wrapper">
                <span className="side-icon">🎓</span>
              </div>
              <h3 className="side-title">For Students & Tenants</h3>
              <p className="side-desc">
                Find safe, verified, and budget-friendly boarding places near
                your university or workplace.
              </p>
              <ul className="side-features">
                <li>
                  <span className="check-icon">✓</span> Search by location,
                  keyword, and price
                </li>
                <li>
                  <span className="check-icon">✓</span> Filter by gender
                  preferences & facilities
                </li>
                <li>
                  <span className="check-icon">✓</span> Direct contact with
                  owners — zero middleman fees
                </li>
                <li>
                  <span className="check-icon">✓</span> Full property details
                  and amenities overview
                </li>
              </ul>
              <Link to="/user" className="btn btn-primary btn-block">
                Browse Boardings Now
              </Link>
            </div>

            {/* For Owners */}
            <div className="side-card owner-card">
              <div className="side-icon-wrapper">
                <span className="side-icon">🔑</span>
              </div>
              <h3 className="side-title">For Property Owners</h3>
              <p className="side-desc">
                Advertise your rooms, houses, and annexes directly to thousands of
                university students.
              </p>
              <ul className="side-features">
                <li>
                  <span className="check-icon">✓</span> Publish boarding listings
                  with complete details
                </li>
                <li>
                  <span className="check-icon">✓</span> Dedicated Owner
                  Dashboard to manage listings
                </li>
                <li>
                  <span className="check-icon">✓</span> Edit or delete your
                  properties anytime
                </li>
                <li>
                  <span className="check-icon">✓</span> Secure role-based
                  ownership protection
                </li>
              </ul>
              <Link to="/register" className="btn btn-outline btn-block">
                Register as Property Owner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header text-center">
            <h2 className="section-title">How Boarding Finder Works</h2>
            <p className="section-subtitle">
              Three simple steps to secure your ideal boarding place.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Search & Filter</h4>
              <p>
                Enter your desired location, set your monthly budget, and select
                facilities like WiFi or attached bathroom.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Review Details</h4>
              <p>
                Check comprehensive room descriptions, gender preferences,
                included amenities, and transparent pricing.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Direct Contact</h4>
              <p>
                Connect directly with the property owner via phone to arrange a
                visit and confirm your booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to start banner */}
      <section className="cta-banner-section">
        <div className="cta-banner-container">
          <h2>Ready to Find Your Next Home?</h2>
          <p>
            Join Boarding Finder today and find accommodation that fits your
            lifestyle and budget.
          </p>
          <div className="cta-banner-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Create an Account
            </Link>
            <Link to="/login" className="btn btn-outline-white btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
