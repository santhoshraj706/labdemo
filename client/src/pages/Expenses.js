import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Food','Transport','Shopping','Entertainment','Health','Utilities','Education','Housing','Other'];

const defaultForm = { title: '', amount: '', category: 'Food', type: 'expense', date: new Date().toISOString().split('T')[0], notes: '' };

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), type: '', category: '' });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await getExpenses(filter);
      setExpenses(data);
    } catch { toast.error('Failed to load expenses'); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateExpense(editing, form);
        toast.success('Transaction updated');
      } else {
        await createExpense(form);
        toast.success('Transaction added');
      }
      setForm(defaultForm);
      setEditing(null);
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exp) => {
    setEditing(exp._id);
    setForm({ title: exp.title, amount: exp.amount, category: exp.category, type: exp.type, date: exp.date.split('T')[0], notes: exp.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteExpense(id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Transactions</h4>
        <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setEditing(null); setShowModal(true); }}>
          <i className="bi bi-plus-lg me-1"></i>Add Transaction
        </button>
      </div>

      {/* Summary */}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="card border-0 bg-success bg-opacity-10 text-center py-3">
            <small className="text-muted">Income</small>
            <div className="fw-bold text-success fs-5">${totalIncome.toFixed(2)}</div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 bg-danger bg-opacity-10 text-center py-3">
            <small className="text-muted">Expenses</small>
            <div className="fw-bold text-danger fs-5">${totalExpense.toFixed(2)}</div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 bg-primary bg-opacity-10 text-center py-3">
            <small className="text-muted">Balance</small>
            <div className={`fw-bold fs-5 ${totalIncome - totalExpense >= 0 ? 'text-primary' : 'text-danger'}`}>
              ${(totalIncome - totalExpense).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <select className="form-select" value={filter.month} onChange={e => setFilter({ ...filter, month: e.target.value })}>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                  <option key={i} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" value={filter.year} onChange={e => setFilter({ ...filter, year: e.target.value })} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}>
                <option value="">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Title</th><th>Category</th><th>Type</th><th>Date</th><th>Amount</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan="6" className="text-center text-muted py-4">No transactions found</td></tr>
              ) : expenses.map(exp => (
                <tr key={exp._id}>
                  <td className="fw-semibold">{exp.title}</td>
                  <td><span className="badge bg-light text-dark border">{exp.category}</span></td>
                  <td>
                    <span className={`badge ${exp.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                      {exp.type}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className={`fw-bold ${exp.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {exp.type === 'income' ? '+' : '-'}${exp.amount.toFixed(2)}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(exp)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(exp._id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">{editing ? 'Edit' : 'Add'} Transaction</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col">
                      <label className="form-label">Amount</label>
                      <input type="number" step="0.01" min="0" className="form-control" value={form.amount}
                        onChange={e => setForm({ ...form, amount: e.target.value })} required />
                    </div>
                    <div className="col">
                      <label className="form-label">Type</label>
                      <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col">
                      <label className="form-label">Category</label>
                      <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes (optional)</label>
                    <textarea className="form-control" rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                    {editing ? 'Update' : 'Add'}
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

export default Expenses;
