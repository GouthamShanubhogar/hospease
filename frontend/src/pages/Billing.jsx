import React, { useState } from 'react';
import Layout from '../components/Layout';
import ModalForm from '../components/ModalForm';
import api from '../services/api';

const Billing = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [line, setLine] = useState({ description: '', qty: 1, price: 0 });

  const addLine = () => {
    setItems(prev => [...prev, { ...line, id: Date.now() }]);
    setLine({ description: '', qty: 1, price: 0 });
  };

  const total = items.reduce((s, it) => s + (it.qty * Number(it.price || 0)), 0);

  const handleGenerate = async () => {
    try {
      await api.post('/api/billing', { items, total });
      setItems([]);
      alert('Invoice generated');
    } catch (err) { console.error(err); }
  };

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Billing</h2>
          <div>
            <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Add Charge</button>
            <button onClick={handleGenerate} className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md">Generate Invoice</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-2">Invoice Preview</h3>
          <div className="space-y-2">
            {items.map(it => (
              <div key={it.id} className="flex justify-between border-b pb-1">
                <div>{it.description} x{it.qty}</div>
                <div>${(it.qty * it.price).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-right font-semibold">Total: ${total.toFixed(2)}</div>
        </div>

        <ModalForm open={open} title="Add Charge" onClose={() => setOpen(false)} onSave={() => { addLine(); setOpen(false); }}>
          <div className="grid grid-cols-1 gap-3">
            <input className="p-2 border rounded" placeholder="Description" value={line.description} onChange={(e) => setLine(l => ({ ...l, description: e.target.value }))} />
            <input className="p-2 border rounded" type="number" placeholder="Qty" value={line.qty} onChange={(e) => setLine(l => ({ ...l, qty: Number(e.target.value) }))} />
            <input className="p-2 border rounded" type="number" placeholder="Price" value={line.price} onChange={(e) => setLine(l => ({ ...l, price: Number(e.target.value) }))} />
          </div>
        </ModalForm>
      </div>
    </Layout>
  );
};

export default Billing;
