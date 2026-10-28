import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon">🏚️</div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-desc">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary btn-lg">
            Return to Home
          </Link>
          <Link to="/user" className="btn btn-outline btn-lg">
            Browse Boardings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
