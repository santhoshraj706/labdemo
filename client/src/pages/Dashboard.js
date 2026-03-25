import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { getSummary, getExpenses, getGoals } from '../utils/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const COLORS = ['#0d6efd','#198754','#ffc107','#dc3545','#0dcaf0','#6f42c1','#fd7e14','#20c997','#6c757d'];

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, byCategory: {} });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  useEffect(() => {
    const load = async () => {
      try {
        const [s, e, g] = await Promise.all([
          getSummary({ month, year }),
          getExpenses({ month, year }),
          getGoals()
        ]);
        setSummary(s.data);
        setRecentExpenses(e.data.slice(0, 5));
        setGoals(g.data.slice(0, 3));
      } catch (err) { console.error(err); }
    };
    load();
  }, [month, year]);

  const cats = Object.keys(summary.byCategory);
  const catVals = Object.values(summary.byCategory);

  const doughnutData = {
    labels: cats,
    datasets: [{ data: catVals, backgroundColor: COLORS, borderWidth: 2 }]
  };

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Welcome back, {user?.name}!</h4>
          <p className="text-muted mb-0">{monthNames[month-1]} {year} overview</p>
        </div>
        <Link to="/expenses" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Add Transaction
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #198754' }}>
            <div className="card-body">
              <p className="text-muted small mb-1"><i className="bi bi-arrow-down-circle text-success me-1"></i>Total Income</p>
              <h3 className="fw-bold text-success mb-0">${summary.totalIncome.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #dc3545' }}>
            <div className="card-body">
              <p className="text-muted small mb-1"><i className="bi bi-arrow-up-circle text-danger me-1"></i>Total Expenses</p>
              <h3 className="fw-bold text-danger mb-0">${summary.totalExpense.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #0d6efd' }}>
            <div className="card-body">
              <p className="text-muted small mb-1"><i className="bi bi-wallet text-primary me-1"></i>Net Balance</p>
              <h3 className={`fw-bold mb-0 ${summary.balance >= 0 ? 'text-primary' : 'text-danger'}`}>
                ${summary.balance.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Doughnut Chart */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="fw-semibold mb-0">Spending by Category</h6>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              {cats.length > 0 ? (
                <div style={{ maxWidth: '260px', width: '100%' }}>
                  <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                </div>
              ) : (
                <p className="text-muted">No expense data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-semibold mb-0">Recent Transactions</h6>
              <Link to="/expenses" className="btn btn-sm btn-outline-primary">View all</Link>
            </div>
            <div className="card-body p-0">
              {recentExpenses.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {recentExpenses.map(exp => (
                    <li key={exp._id} className="list-group-item d-flex justify-content-between align-items-center px-3">
                      <div>
                        <span className="fw-semibold">{exp.title}</span>
                        <span className="badge bg-light text-muted ms-2 small">{exp.category}</span>
                        <div className="text-muted small">{new Date(exp.date).toLocaleDateString()}</div>
                      </div>
                      <span className={`fw-bold ${exp.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {exp.type === 'income' ? '+' : '-'}${exp.amount.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-muted">No transactions this month</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Goals Preview */}
      {goals.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
            <h6 className="fw-semibold mb-0"><i className="bi bi-bullseye me-2 text-primary"></i>Active Goals</h6>
            <Link to="/goals" className="btn btn-sm btn-outline-primary">View all</Link>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {goals.map(goal => {
                const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                return (
                  <div key={goal._id} className="col-md-4">
                    <div className="p-3 bg-light rounded">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold small">{goal.title}</span>
                        <span className="text-muted small">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div className="progress-bar bg-primary" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="d-flex justify-content-between mt-1">
                        <span className="text-muted small">${goal.savedAmount.toFixed(0)}</span>
                        <span className="text-muted small">${goal.targetAmount.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
