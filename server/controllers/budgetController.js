const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc Get budgets with spending
// @route GET /api/budgets
const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month: m, year: y });

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user._id,
      type: 'expense',
      date: { $gte: start, $lte: end }
    });

    const spendingByCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const budgetsWithSpending = budgets.map(b => ({
      ...b.toObject(),
      spent: spendingByCategory[b.category] || 0,
      remaining: b.limit - (spendingByCategory[b.category] || 0)
    }));

    res.json(budgetsWithSpending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create or update budget
// @route POST /api/budgets
const upsertBudget = async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month, year },
      { limit },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete budget
// @route DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    if (budget.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await budget.deleteOne();
    res.json({ message: 'Budget removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBudgets, upsertBudget, deleteBudget };
