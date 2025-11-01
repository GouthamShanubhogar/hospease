import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import ModalForm from '../components/ModalForm';
import api from '../services/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', phone: '' });

  useEffect(() => {
    let mounted = true;
    api.get('/api/patients')
      .then(res => {
        if (!mounted) return;
        setPatients(res.data || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'age', title: 'Age' },
    { key: 'gender', title: 'Gender' },
    { key: 'phone', title: 'Phone' },
  ];

  const handleSave = async () => {
    try {
      await api.post('/api/patients', form);
      const res = await api.get('/api/patients');
      setPatients(res.data || []);
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Patients</h2>
          <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Add Patient</button>
        </div>

        <div>
          {loading ? <div>Loading...</div> : <Table columns={columns} data={patients} />}
        </div>

        <ModalForm open={open} title="Add Patient" onClose={() => setOpen(false)} onSave={handleSave}>
          <div className="grid grid-cols-1 gap-3">
            <input className="p-2 border rounded" placeholder="Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="p-2 border rounded" placeholder="Age" value={form.age} onChange={(e) => setForm(f => ({ ...f, age: e.target.value }))} />
            <select className="p-2 border rounded" value={form.gender} onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <input className="p-2 border rounded" placeholder="Phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
        </ModalForm>
      </div>
    </Layout>
  );
};

export default Patients;
