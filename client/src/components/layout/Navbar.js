import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-wallet2 me-2"></i>FinanceTracker
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        {user && (
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">
                  <i className="bi bi-speedometer2 me-1"></i>Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/expenses')}`} to="/expenses">
                  <i className="bi bi-receipt me-1"></i>Expenses
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/budget')}`} to="/budget">
                  <i className="bi bi-pie-chart me-1"></i>Budget
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/goals')}`} to="/goals">
                  <i className="bi bi-bullseye me-1"></i>Goals
                </Link>
              </li>
            </ul>
            <div className="d-flex align-items-center gap-2">
              <span className="text-white-50 small">
                <i className="bi bi-person-circle me-1"></i>{user.name}
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
