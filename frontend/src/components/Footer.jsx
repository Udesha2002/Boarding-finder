import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">🏠</span>
              <span className="logo-text">Boarding Finder</span>
            </div>
            <p className="footer-tagline">
              Connecting university students and tenants with verified, quality
              boarding accommodations across Sri Lanka.
            </p>
          </div>

          <div className="footer-links-group">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/user">Find Boarding</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Create Account</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Property Owners</h4>
            <ul>
              <li>
                <Link to="/register">List Your Boarding</Link>
              </li>
              <li>
                <Link to="/owner">Owner Dashboard</Link>
              </li>
              <li>
                <Link to="/owner/add">Add Listing</Link>
              </li>
              <li>
                <Link to="/login">Owner Sign In</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Help & Support</h4>
            <ul>
              <li>
                <span className="footer-contact-item">📧 support@boardingfinder.lk</span>
              </li>
              <li>
                <span className="footer-contact-item">📞 +94 11 234 5678</span>
              </li>
              <li>
                <span className="footer-contact-item">📍 Colombo, Sri Lanka</span>
              </li>
              <li>
                <span className="footer-badge-pill">✓ Verified Stays</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Boarding Finder. All rights reserved.</p>
          <p className="footer-tech">Verified & Secure Student Accommodation Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
