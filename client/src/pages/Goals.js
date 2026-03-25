import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GOAL_CATEGORIES = ['Emergency Fund','Vacation','Home','Car','Education','Retirement','Other'];

const defaultForm = { title: '', targetAmount: '', savedAmount: '', category: 'Other', deadline: '', notes: '' };

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmt, setDepositAmt] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await getGoals();
      setGoals(data);
    } catch { toast.error('Failed to load goals'); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateGoal(editing, form);
        toast.success('Goal updated!');
      } else {
        await createGoal(form);
        toast.success('Goal created!');
      }
      setForm(defaultForm);
      setEditing(null);
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const newSaved = depositGoal.savedAmount + parseFloat(depositAmt);
      await updateGoal(depositGoal._id, { savedAmount: newSaved });
      toast.success('Deposit added!');
      setDepositGoal(null);
      setDepositAmt('');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await deleteGoal(id);
      toast.success('Goal deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const statusColor = { active: 'primary', completed: 'success', paused: 'warning' };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Financial Goals</h4>
        <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setEditing(null); setShowModal(true); }}>
          <i className="bi bi-plus-lg me-1"></i>New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 bg-primary bg-opacity-10 text-center py-3">
            <small className="text-muted">Total Goals</small>
            <div className="fw-bold fs-4 text-primary">{goals.length}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-success bg-opacity-10 text-center py-3">
            <small className="text-muted">Completed</small>
            <div className="fw-bold fs-4 text-success">{goals.filter(g => g.status === 'completed').length}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-warning bg-opacity-10 text-center py-3">
            <small className="text-muted">Total Saved</small>
            <div className="fw-bold fs-4 text-warning">${goals.reduce((s, g) => s + g.savedAmount, 0).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-bullseye display-4 d-block mb-3"></i>
          <p>No goals yet. Set your first financial goal!</p>
          <button className="btn btn-outline-primary" onClick={() => setShowModal(true)}>Create a goal</button>
        </div>
      ) : (
        <div className="row g-3">
          {goals.map(goal => {
            const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000) : null;
            return (
              <div key={goal._id} className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold mb-1">{goal.title}</h6>
                        <span className="badge bg-light text-dark border me-2">{goal.category}</span>
                        <span className={`badge bg-${statusColor[goal.status]} bg-opacity-25 text-${statusColor[goal.status]}`}>
                          {goal.status}
                        </span>
                      </div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-success" title="Add deposit"
                          onClick={() => { setDepositGoal(goal); setDepositAmt(''); }}>
                          <i className="bi bi-plus-circle"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => {
                          setEditing(goal._id);
                          setForm({ title: goal.title, targetAmount: goal.targetAmount, savedAmount: goal.savedAmount,
                            category: goal.category, deadline: goal.deadline ? goal.deadline.split('T')[0] : '', notes: goal.notes || '' });
                          setShowModal(true);
                        }}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(goal._id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Saved: <strong>${goal.savedAmount.toFixed(2)}</strong></span>
                      <span className="text-muted small">Target: <strong>${goal.targetAmount.toFixed(2)}</strong></span>
                    </div>
                    <div className="progress mb-2" style={{ height: '12px', borderRadius: '6px' }}>
                      <div className={`progress-bar ${goal.status === 'completed' ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${pct}%`, borderRadius: '6px' }}></div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">{pct.toFixed(1)}% complete</small>
                      {daysLeft !== null && (
                        <small className={daysLeft < 30 ? 'text-danger' : 'text-muted'}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                        </small>
                      )}
                    </div>
                    {goal.notes && <p className="text-muted small mt-2 mb-0 fst-italic">{goal.notes}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">{editing ? 'Edit' : 'New'} Goal</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Goal Title</label>
                    <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Emergency Fund" />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col">
                      <label className="form-label">Target Amount ($)</label>
                      <input type="number" min="0" step="0.01" className="form-control" value={form.targetAmount}
                        onChange={e => setForm({ ...form, targetAmount: e.target.value })} required />
                    </div>
                    <div className="col">
                      <label className="form-label">Already Saved ($)</label>
                      <input type="number" min="0" step="0.01" className="form-control" value={form.savedAmount}
                        onChange={e => setForm({ ...form, savedAmount: e.target.value })} />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col">
                      <label className="form-label">Category</label>
                      <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        {GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col">
                      <label className="form-label">Deadline (optional)</label>
                      <input type="date" className="form-control" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
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
                    {editing ? 'Update' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositGoal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Add Deposit</h5>
                <button className="btn-close" onClick={() => setDepositGoal(null)}></button>
              </div>
              <form onSubmit={handleDeposit}>
                <div className="modal-body">
                  <p className="text-muted small mb-2">Goal: <strong>{depositGoal.title}</strong></p>
                  <label className="form-label">Amount ($)</label>
                  <input type="number" min="0.01" step="0.01" className="form-control" value={depositAmt}
                    onChange={e => setDepositAmt(e.target.value)} required autoFocus />
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setDepositGoal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Add Deposit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
