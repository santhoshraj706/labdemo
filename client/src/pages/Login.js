import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login as loginAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginAPI(form);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i className="bi bi-wallet2 text-primary" style={{ fontSize: '2.5rem' }}></i>
            <h3 className="fw-bold mt-2">FinanceTracker</h3>
            <p className="text-muted">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email" name="email" className="form-control form-control-lg"
                placeholder="you@example.com" value={form.email} onChange={handleChange} required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password" name="password" className="form-control form-control-lg"
                placeholder="••••••••" value={form.password} onChange={handleChange} required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              Sign In
            </button>
          </form>
          <hr className="my-4" />
          <p className="text-center text-muted mb-0">
            Don't have an account? <Link to="/register" className="text-primary fw-semibold">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
