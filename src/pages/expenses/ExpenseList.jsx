import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  Eye,
  FileText,
  IndianRupee,
  Layers3,
  Receipt,
  Trash2,
  Upload,
  WalletCards
} from 'lucide-react';
import { expenseService } from '../../services/expense.service';
import {
  ExpenseListView,
  ExpenseOverview,
  ExpenseOverviewStats,
  ExpensesHeader,
  ExpenseTabs,
} from '../../components/expenses';
import '../../styles/expense-management.css';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const expenseCategories = [
  'Stock Purchase',
  'Utilities',
  'Equipment Maintenance',
  'Consumables & Tools',
  'Rent & Lease',
  'Staff Refreshments',
  'Marketing & Ads',
  'Transport & Fuel',
  'Office & Admin',
  'Cleaning & Waste',
  'Professional Fees',
  'Miscellaneous'
];

const paymentMethods = ['Cash', 'UPI', 'Bank Transfer', 'Company Card', 'Cheque'];

const today = () => new Date().toISOString().split('T')[0];

const emptyForm = {
  title: '',
  category: 'Utilities',
  amount: '',
  expenseDate: today(),
  vendor: '',
  paymentMethod: 'UPI',
  referenceNo: '',
  taxAmount: '',
  status: 'approved',
  notes: '',
  receiptName: ''
};

const normalize = (expense = {}) => ({
  ...expense,
  title: expense.title || expense.description || expense.category || 'Workshop Expense',
  category: expense.category || 'Miscellaneous',
  amount: Number(expense.amount || 0),
  expenseDate: expense.expenseDate || expense.date || today(),
  vendor: expense.vendor || 'General Supplier',
  paymentMethod: expense.paymentMethod || expense.method || 'Cash',
  referenceNo: expense.referenceNo || expense.reference || '',
  taxAmount: Number(expense.taxAmount || 0),
  status: String(expense.status || 'approved').toLowerCase(),
  notes: expense.notes || '',
  receiptName: expense.receiptName || ''
});

const statusClass = (status = '') => `is-${String(status).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const Metric = ({ label, value, icon: Icon, tone = 'primary', note }) => (
  <article className="expense-metric-card">
    <div className="expense-metric-card__top">
      <span>{label}</span>
      <i className={`is-${tone}`}><Icon size={16}/></i>
    </div>
    <strong>{value}</strong>
    {note ? <small>{note}</small> : null}
  </article>
);

const Field = ({ label, children, wide = false }) => (
  <label className={wide ? 'expense-field is-wide' : 'expense-field'}>
    <span>{label}</span>
    {children}
  </label>
);

const ExpenseForm = ({
  title,
  values,
  setValues,
  onSubmit,
  onCancel,
  submitting
}) => (
  <div className="expense-form-page cg-expenses">
    <header className="expense-form-header">
      <div>
        <h1>{title}</h1>
        <p>Record workshop operational costs, vendor bills, payment method, reference and receipt.</p>
      </div>
    </header>

    <form className="expense-form" onSubmit={onSubmit}>
      <section className="expense-form-section">
        <div className="expense-section-header">
          <div>
            <h2>Expense Information</h2>
            <p>Date, category, vendor and expense title.</p>
          </div>
        </div>

        <div className="expense-form-grid">
          <Field label="Expense Date">
            <input type="date" required value={values.expenseDate} onChange={(e)=>setValues({...values,expenseDate:e.target.value})}/>
          </Field>

          <Field label="Category">
            <select value={values.category} onChange={(e)=>setValues({...values,category:e.target.value})}>
              {expenseCategories.map((category)=><option key={category}>{category}</option>)}
            </select>
          </Field>

          <Field label="Expense Title" wide>
            <input required value={values.title} onChange={(e)=>setValues({...values,title:e.target.value})} placeholder="e.g. Monthly workshop electricity bill"/>
          </Field>

          <Field label="Vendor / Payable To">
            <input value={values.vendor} onChange={(e)=>setValues({...values,vendor:e.target.value})} placeholder="Supplier or payable party"/>
          </Field>

          <Field label="Status">
            <select value={values.status} onChange={(e)=>setValues({...values,status:e.target.value})}>
              <option value="draft">Draft</option>
              <option value="pending approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="expense-form-section">
        <div className="expense-section-header">
          <div>
            <h2>Payment & Amount</h2>
            <p>Expense value, tax, payment method and bill reference.</p>
          </div>
        </div>

        <div className="expense-form-grid">
          <Field label="Expense Amount">
            <input type="number" min="0" step="0.01" required value={values.amount} onChange={(e)=>setValues({...values,amount:e.target.value})}/>
          </Field>

          <Field label="Tax / GST Amount">
            <input type="number" min="0" step="0.01" value={values.taxAmount} onChange={(e)=>setValues({...values,taxAmount:e.target.value})}/>
          </Field>

          <Field label="Payment Method">
            <select value={values.paymentMethod} onChange={(e)=>setValues({...values,paymentMethod:e.target.value})}>
              {paymentMethods.map((method)=><option key={method}>{method}</option>)}
            </select>
          </Field>

          <Field label="Reference / Bill Number">
            <input value={values.referenceNo} onChange={(e)=>setValues({...values,referenceNo:e.target.value})} placeholder="INV / UTR / Cheque reference"/>
          </Field>
        </div>
      </section>

      <section className="expense-form-section">
        <div className="expense-section-header">
          <div>
            <h2>Receipt & Notes</h2>
            <p>Attach bill metadata and store additional accounting notes.</p>
          </div>
        </div>

        <div className="expense-form-grid">
          <label className="expense-upload is-wide">
            <Upload size={16}/>
            <div>
              <strong>{values.receiptName || 'Attach Receipt / Bill'}</strong>
              <span>Image or PDF filename will be stored with this mock record.</span>
            </div>
            <input type="file" onChange={(e)=>setValues({...values,receiptName:e.target.files?.[0]?.name || ''})}/>
          </label>

          <Field label="Notes" wide>
            <textarea rows="4" value={values.notes} onChange={(e)=>setValues({...values,notes:e.target.value})} placeholder="Expense purpose, approval notes, recurring details..."/>
          </Field>
        </div>
      </section>

      <div className="expense-form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button className="is-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Expense'}</button>
      </div>
    </form>
  </div>
);

export const ExpenseList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const isNew = location.pathname === '/expenses/new';
  const isEdit = Boolean(id && location.pathname.endsWith('/edit'));
  const isDetail = Boolean(id && !isEdit && location.pathname !== '/expenses');

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await expenseService.getExpenses();
      setExpenses(rows.map(normalize));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!isEdit || !id || !expenses.length) return;
    const expense = expenses.find((item)=>item.id===id);
    if (!expense) return;
    setForm({
      title: expense.title || '',
      category: expense.category || 'Miscellaneous',
      amount: expense.amount || '',
      expenseDate: expense.expenseDate || today(),
      vendor: expense.vendor || '',
      paymentMethod: expense.paymentMethod || 'Cash',
      referenceNo: expense.referenceNo || '',
      taxAmount: expense.taxAmount || '',
      status: expense.status || 'approved',
      notes: expense.notes || '',
      receiptName: expense.receiptName || ''
    });
  }, [isEdit, id, expenses]);

  const selectedExpense = useMemo(
    () => expenses.find((expense)=>expense.id===id) || null,
    [expenses, id]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter((expense) => {
      const queryMatch = !q || [
        expense.id,
        expense.title,
        expense.category,
        expense.vendor,
        expense.referenceNo,
        expense.paymentMethod
      ].some((value)=>String(value || '').toLowerCase().includes(q));
      const categoryMatch = categoryFilter === 'All' || expense.category === categoryFilter;
      const statusMatch = statusFilter === 'All' || expense.status === statusFilter.toLowerCase();
      return queryMatch && categoryMatch && statusMatch;
    });
  }, [expenses, query, categoryFilter, statusFilter]);

  const currentMonth = new Date().toISOString().slice(0,7);
  const currentMonthRows = expenses.filter((expense)=>String(expense.expenseDate).startsWith(currentMonth));
  const approvedRows = expenses.filter((expense)=>expense.status==='approved');
  const pendingRows = expenses.filter((expense)=>expense.status==='pending approval');
  const todayRows = expenses.filter((expense)=>expense.expenseDate===today());

  const categoryTotals = useMemo(() => {
    const totals = {};
    expenses.forEach((expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return Object.entries(totals)
      .map(([category,total])=>({category,total}))
      .sort((a,b)=>b.total-a.total);
  }, [expenses]);

  const paymentTotals = useMemo(() => {
    const totals = {};
    expenses.forEach((expense) => {
      totals[expense.paymentMethod] = (totals[expense.paymentMethod] || 0) + expense.amount;
    });
    return Object.entries(totals)
      .map(([method,total])=>({method,total}))
      .sort((a,b)=>b.total-a.total);
  }, [expenses]);

  const saveExpense = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount || 0),
        taxAmount: Number(form.taxAmount || 0)
      };

      if (isEdit && id) {
        await expenseService.updateExpense(id, payload);
        navigate(`/expenses/${id}`);
      } else {
        const created = await expenseService.createExpense(payload);
        navigate(created?.id ? `/expenses/${created.id}` : '/expenses');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeExpense = async (expense) => {
    if (!window.confirm(`Delete expense ${expense.id}?`)) return;
    await expenseService.deleteExpense(expense.id);
    if (isDetail) navigate('/expenses');
    else await load();
  };

  if (loading) return <div className="expense-empty">Loading expenses...</div>;

  if (isNew) {
    return (
      <ExpenseForm
        title="Add Expense"
        values={form}
        setValues={setForm}
        onSubmit={saveExpense}
        onCancel={()=>navigate('/expenses')}
        submitting={submitting}
      />
    );
  }

  if (isEdit) {
    if (!selectedExpense) return <div className="expense-empty">Expense not found.</div>;
    return (
      <ExpenseForm
        title="Edit Expense"
        values={form}
        setValues={setForm}
        onSubmit={saveExpense}
        onCancel={()=>navigate(`/expenses/${id}`)}
        submitting={submitting}
      />
    );
  }

  if (isDetail) {
    if (!selectedExpense) return <div className="expense-empty">Expense not found.</div>;

    return (
      <div className="expense-management-page expense-detail-page cg-expenses">
        <header className="expense-detail-header">
          <div>
            <span>{selectedExpense.id}</span>
            <h1>{selectedExpense.title}</h1>
            <p>{selectedExpense.category} · {selectedExpense.expenseDate}</p>
          </div>

          <div className="expense-detail-actions">
            <button onClick={()=>navigate(`/expenses/${selectedExpense.id}/edit`)}><Edit3 size={14}/> Edit</button>
            <button className="is-danger" onClick={()=>removeExpense(selectedExpense)}><Trash2 size={14}/> Delete</button>
          </div>
        </header>

        <div className="expense-detail-kpis">
          <div><IndianRupee size={16}/><span>Amount</span><strong>{money.format(selectedExpense.amount)}</strong></div>
          <div><WalletCards size={16}/><span>Payment</span><strong>{selectedExpense.paymentMethod}</strong></div>
          <div><Calendar size={16}/><span>Date</span><strong>{selectedExpense.expenseDate}</strong></div>
          <div><CheckCircle2 size={16}/><span>Status</span><strong>{selectedExpense.status}</strong></div>
        </div>

        <div className="expense-two-column">
          <section className="expense-panel">
            <div className="expense-section-header">
              <div>
                <h2>Expense Details</h2>
                <p>Vendor, amount, payment and accounting reference.</p>
              </div>
            </div>

            <div className="expense-info-grid">
              <div><span>Expense ID</span><strong>{selectedExpense.id}</strong></div>
              <div><span>Category</span><strong>{selectedExpense.category}</strong></div>
              <div><span>Vendor</span><strong>{selectedExpense.vendor}</strong></div>
              <div><span>Payment Method</span><strong>{selectedExpense.paymentMethod}</strong></div>
              <div><span>Amount</span><strong>{money.format(selectedExpense.amount)}</strong></div>
              <div><span>Tax / GST</span><strong>{money.format(selectedExpense.taxAmount)}</strong></div>
              <div><span>Reference</span><strong>{selectedExpense.referenceNo || '—'}</strong></div>
              <div><span>Status</span><strong>{selectedExpense.status}</strong></div>
            </div>
          </section>

          <section className="expense-panel">
            <div className="expense-section-header">
              <div>
                <h2>Receipt & Notes</h2>
                <p>Bill attachment metadata and expense notes.</p>
              </div>
              <Receipt size={18}/>
            </div>

            <div className="expense-receipt-box">
              <FileText size={20}/>
              <div>
                <strong>{selectedExpense.receiptName || 'No receipt attached'}</strong>
                <span>{selectedExpense.referenceNo || 'No bill reference'}</span>
              </div>
            </div>

            <div className="expense-notes-box">
              {selectedExpense.notes || 'No additional notes recorded.'}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-management-page cg-expenses">
      <ExpensesHeader onAdd={()=>navigate('/expenses/new')} />

      <ExpenseOverviewStats
        currentMonthTotal={currentMonthRows.reduce((sum,item)=>sum+item.amount,0)}
        approvedTotal={approvedRows.reduce((sum,item)=>sum+item.amount,0)}
        pendingCount={pendingRows.length}
        todayTotal={todayRows.reduce((sum,item)=>sum+item.amount,0)}
        formatMoney={(value)=>money.format(value || 0)}
      />

      <ExpenseTabs active={activeView} onChange={setActiveView} />

      {activeView === 'overview' ? (
        <ExpenseOverview
          expenses={expenses}
          categoryTotals={categoryTotals}
          formatMoney={(value)=>money.format(value || 0)}
          onOpen={(expense)=>navigate(`/expenses/${expense.id}`)}
        />
      ) : null}

      {activeView === 'expenses' ? (
        <ExpenseListView
          expenses={filtered}
          query={query}
          onQueryChange={setQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categories={expenseCategories}
          formatMoney={(value)=>money.format(value || 0)}
          onView={(expense)=>navigate(`/expenses/${expense.id}`)}
          onEdit={(expense)=>navigate(`/expenses/${expense.id}/edit`)}
          onDelete={removeExpense}
        />
      ) : null}

      {activeView === 'categories' ? (
        <section className="expense-panel">
          <div className="expense-section-header">
            <div>
              <h2>Expense Categories</h2>
              <p>Workshop operating-cost groups and current recorded spend.</p>
            </div>
          </div>

          <div className="expense-category-grid">
            {expenseCategories.map((category)=>{
              const rows=expenses.filter((expense)=>expense.category===category);
              const total=rows.reduce((sum,item)=>sum+item.amount,0);
              return (
                <article key={category} className="expense-category-card">
                  <div><Layers3 size={16}/><strong>{category}</strong></div>
                  <div><span>Records <b>{rows.length}</b></span><span>Total Spend <b>{money.format(total)}</b></span></div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeView === 'reports' ? (
        <div className="expense-management-view">
          <div className="expense-metric-grid is-four">
            <Metric label="Total Expenses" value={money.format(expenses.reduce((sum,item)=>sum+item.amount,0))} icon={CircleDollarSign}/>
            <Metric label="Tax / GST" value={money.format(expenses.reduce((sum,item)=>sum+item.taxAmount,0))} icon={FileText}/>
            <Metric label="Avg Expense" value={money.format(expenses.length ? expenses.reduce((sum,item)=>sum+item.amount,0)/expenses.length : 0)} icon={BarChart3}/>
            <Metric label="Vendors" value={new Set(expenses.map((item)=>item.vendor)).size} icon={WalletCards}/>
          </div>

          <div className="expense-two-column">
            <section className="expense-panel">
              <div className="expense-section-header"><div><h2>Category Report</h2><p>Spend distribution by expense category.</p></div></div>
              <div className="expense-row-list">
                {categoryTotals.map((row)=><div key={row.category} className="expense-data-row"><div><strong>{row.category}</strong><span>Category spend</span></div><b>{money.format(row.total)}</b></div>)}
              </div>
            </section>

            <section className="expense-panel">
              <div className="expense-section-header"><div><h2>Payment Method Report</h2><p>Expense spend by payment mode.</p></div></div>
              <div className="expense-row-list">
                {paymentTotals.map((row)=><div key={row.method} className="expense-data-row"><div><strong>{row.method}</strong><span>Payment channel</span></div><b>{money.format(row.total)}</b></div>)}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ExpenseList;
