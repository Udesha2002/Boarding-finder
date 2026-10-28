import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, isOwner, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">🏠</span>
          <span className="brand-text">Boarding Finder</span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className={`navbar-toggle ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-menu ${mobileMenuOpen ? "open" : ""}`}>
          <div className="navbar-links">
            {/* If NOT logged in */}
            {!isAuthenticated && (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMenu}
                  end
                >
                  Home
                </NavLink>
                <NavLink
                  to="/user"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMenu}
                >
                  Find Boarding
                </NavLink>
              </>
            )}

            {/* If logged in as USER */}
            {isAuthenticated && !isOwner && (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMenu}
                  end
                >
                  Home
                </NavLink>
                <NavLink
                  to="/user"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMenu}
                >
                  Find Boarding
                </NavLink>
                <NavLink
                  to="/user/bookings"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMenu}
                >
                  My Bookings
                </NavLink>
              </>
            )}

            {/* If logged in as OWNER */}
            {isAuthenticated && isOwner && (
              <>
                <NavLink
                  to="/owner"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMenu}
                  end
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/owner/add"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMenu}
                >
                  Add Accommodation
                </NavLink>
              </>
            )}
          </div>

          {/* User Auth Section */}
          <div className="navbar-auth">
            {!isAuthenticated ? (
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className="btn btn-outline"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="user-profile-menu">
                <span className="user-badge">
                  <span className="user-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="user-details">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-role">
                      {isOwner ? "Property Owner" : "Student / User"}
                    </span>
                  </span>
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
