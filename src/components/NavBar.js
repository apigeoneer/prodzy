// NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/questions" className="nav-link">PM Interview Questions</Link>
        <Link to="/stories" className="nav-link">PM Stories</Link>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <Link to="/profile" className="profile-icon">👤</Link>
            <button onClick={onLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
