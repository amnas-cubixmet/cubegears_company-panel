import React, { useState } from 'react';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreateInvoice = () => {
  const navigate = useNavigate();
  const [lineItems, setLineItems] = useState([
    { description: 'Full Engine Tuneup', qty: 1, unitPrice: 250.00 },
    { description: 'Castrol EDGE 5W-30', qty: 4, unitPrice: 12.50 }
  ]);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', qty: 1, unitPrice: 0.00 }]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Issue Digital Invoice</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>Create customer invoice from job card or custom service items.</p>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <Select label="Customer" options={[{ value: 'CUS-0001', label: 'Sarah Jenkins (CUS-0001)' }]} />
          <Select label="Linked Job Card" options={[{ value: 'JOB-0001', label: 'JOB-0001 (Toyota Camry)' }]} />
        </div>

        <h3 style={{ color: '#f8fafc', marginBottom: '12px', fontSize: '16px' }}>Invoice Line Items</h3>

        {/* Stacked Line Item Cards for Mobile Touch Friendliness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {lineItems.map((item, idx) => (
            <div key={idx} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Input
                label="Item Description"
                value={item.description}
                onChange={(e) => {
                  const updated = [...lineItems];
                  updated[idx].description = e.target.value;
                  setLineItems(updated);
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '12px', alignItems: 'flex-end' }}>
                <Input
                  label="Qty"
                  type="number"
                  value={item.qty}
                  onChange={(e) => {
                    const updated = [...lineItems];
                    updated[idx].qty = parseFloat(e.target.value) || 0;
                    setLineItems(updated);
                  }}
                />
                <Input
                  label="Unit Price ($)"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => {
                    const updated = [...lineItems];
                    updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                    setLineItems(updated);
                  }}
                />
                {lineItems.length > 1 && (
                  <button onClick={() => removeLineItem(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', height: '44px', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addLineItem} style={{ marginBottom: '24px' }}>
          <Plus size={16} /> Add Line Item
        </Button>

        {/* Invoice Total Calculation */}
        <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>Sales Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc', fontWeight: '700', fontSize: '18px', borderTop: '1px solid #334155', paddingTop: '8px' }}>
            <span>Total Payable</span>
            <span style={{ color: '#34d399' }}>${total.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <Button variant="primary" onClick={() => navigate('/invoices')}>Issue Invoice</Button>
          <Button variant="outline" onClick={() => navigate('/invoices')}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};
