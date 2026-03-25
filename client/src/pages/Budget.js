import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getBudgets, upsertBudget, deleteBudget, getExpenses } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Food','Transport','Shopping','Entertainment','Health','Utilities','Education','Housing','Other'];

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: 'Food', limit: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);
  const [selYear, setSelYear] = useState(new Date().getFullYear());

  const load = useCallback(async () => {
    try {
      const { data } = await getBudgets({ month: selMonth, year: selYear });
      setBudgets(data);
    } catch { toast.error('Failed to load budgets'); }
  }, [selMonth, selYear]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertBudget({ ...form, month: selMonth, year: selYear });
      toast.success('Budget saved!');
      setShowModal(false);
      setForm({ category: 'Food', limit: '', month: selMonth, year: selYear });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await deleteBudget(id);
      toast.success('Budget deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Budget Planner</h4>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-1"></i>Set Budget
        </button>
      </div>

      {/* Month selector */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-auto"><label className="form-label mb-0 fw-semibold">Viewing:</label></div>
            <div className="col-md-3">
              <select className="form-select" value={selMonth} onChange={e => setSelMonth(parseInt(e.target.value))}>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                  <option key={i} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" value={selYear} onChange={e => setSelYear(parseInt(e.target.value))} />
            </div>
            <div className="col-md-5 ms-auto text-end">
              <span className="text-muted me-3">Total Budget: <strong>${totalBudget.toFixed(2)}</strong></span>
              <span className="text-muted">Spent: <strong className="text-danger">${totalSpent.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-pie-chart display-4 d-block mb-3"></i>
          <p>No budgets set for this month.</p>
          <button className="btn btn-outline-primary" onClick={() => setShowModal(true)}>Set your first budget</button>
        </div>
      ) : (
        <div className="row g-3">
          {budgets.map(b => {
            const pct = Math.min((b.spent / b.limit) * 100, 100);
            const over = b.spent > b.limit;
            return (
              <div key={b._id} className="col-md-6 col-lg-4">
                <div className={`card border-0 shadow-sm h-100 ${over ? 'border-danger border' : ''}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-semibold mb-0">{b.category}</h6>
                      <button className="btn btn-sm text-danger p-0" onClick={() => handleDelete(b._id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">Spent: <span className={`fw-bold ${over ? 'text-danger' : 'text-dark'}`}>${b.spent.toFixed(2)}</span></small>
                      <small className="text-muted">Limit: <span className="fw-bold">${b.limit.toFixed(2)}</span></small>
                    </div>
                    <div className="progress mb-2" style={{ height: '10px' }}>
                      <div
                        className={`progress-bar ${over ? 'bg-danger' : pct > 75 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className={over ? 'text-danger fw-semibold' : 'text-muted'}>
                        {over ? `Over by $${(b.spent - b.limit).toFixed(2)}` : `$${b.remaining.toFixed(2)} remaining`}
                      </small>
                      <small className="text-muted">{pct.toFixed(0)}%</small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Set Budget</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Monthly Limit ($)</label>
                    <input type="number" min="0" step="0.01" className="form-control" value={form.limit}
                      onChange={e => setForm({ ...form, limit: e.target.value })} required />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}Save Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
