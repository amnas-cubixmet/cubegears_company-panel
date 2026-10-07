import React from 'react';
import { Eye, ReceiptText } from 'lucide-react';
import { formatPaymentDate, paymentStatusClass } from './payments.utils';

export const PaymentRecordsPanel = ({
  payments,
  loading,
  formatMoney,
  onView,
}) => (
  <section className="payments-dashboard-records">
    <header className="payments-dashboard-section-title">
      <div>
        <h2>Payment Records</h2>
        <p>Customer collections linked to workshop invoices.</p>
      </div>
      <span>{payments.length} record{payments.length === 1 ? '' : 's'}</span>
    </header>

    {loading ? (
      <div className="payments-dashboard-empty">Loading payments…</div>
    ) : payments.length === 0 ? (
      <div className="payments-dashboard-empty">
        <ReceiptText size={14} />
        No payment records matched your filters.
      </div>
    ) : (
      <>
        <div className="payments-dashboard-table-wrap">
          <table className="payments-dashboard-table">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Customer / Invoice</th>
                <th>Date</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Status</th>
                <th aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {payments.map((row) => (
                <tr key={row.id}>
                  <td>
                    <button type="button" onClick={() => onView(row)}>
                      <strong>{row.receiptNo || row.id}</strong>
                      <span>{row.id}</span>
                    </button>
                  </td>
                  <td>
                    <strong>{row.customer || 'Customer'}</strong>
                    <span>{row.invoice || 'No invoice'}</span>
                  </td>
                  <td>{formatPaymentDate(row.date)}</td>
                  <td>{row.method || '—'}</td>
                  <td>{row.reference || '—'}</td>
                  <td><strong>{formatMoney(row.amount || 0)}</strong></td>
                  <td>
                    <span className={'payments-dashboard-status ' + paymentStatusClass(row.status)}>
                      {row.status || 'Completed'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="payments-dashboard-view-btn" onClick={() => onView(row)} title="View payment">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="payments-dashboard-mobile-list">
          {payments.map((row) => (
            <article key={row.id} className="payments-dashboard-mobile-card">
              <div className="payments-dashboard-mobile-head">
                <div>
                  <strong>{row.receiptNo || row.id}</strong>
                  <span>{row.customer || 'Customer'}</span>
                </div>
                <span className={'payments-dashboard-status ' + paymentStatusClass(row.status)}>
                  {row.status || 'Completed'}
                </span>
              </div>

              <div className="payments-dashboard-mobile-meta">
                <div><span>Invoice</span><strong>{row.invoice || '—'}</strong></div>
                <div><span>Date</span><strong>{formatPaymentDate(row.date)}</strong></div>
                <div><span>Method</span><strong>{row.method || '—'}</strong></div>
                <div><span>Amount</span><strong>{formatMoney(row.amount || 0)}</strong></div>
              </div>

              {row.reference && (
                <div className="payments-dashboard-reference">
                  <span>Reference</span>
                  <strong>{row.reference}</strong>
                </div>
              )}

              <button type="button" className="payments-dashboard-mobile-view" onClick={() => onView(row)}>
                <Eye size={12} />
                View Payment
              </button>
            </article>
          ))}
        </div>
      </>
    )}
  </section>
);
