import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import ModalForm from '../components/ModalForm';
import api from '../services/api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', hospital_id: '', specialty: '' });

  useEffect(() => {
    let mounted = true;
    api.get('/api/doctors')
      .then(res => { if (!mounted) return; setDoctors(res.data || []); })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'specialty', title: 'Specialty' },
    { key: 'hospital_name', title: 'Hospital' },
  ];

  const handleSave = async () => {
    try {
      await api.post('/api/doctors', form);
      const res = await api.get('/api/doctors');
      setDoctors(res.data || []);
      setOpen(false);
    } catch (err) { console.error(err); }
  };

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Doctors</h2>
          <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Add Doctor</button>
        </div>

        <div>
          {loading ? <div>Loading...</div> : <Table columns={columns} data={doctors} />}
        </div>

        <ModalForm open={open} title="Add Doctor" onClose={() => setOpen(false)} onSave={handleSave}>
          <div className="grid grid-cols-1 gap-3">
            <input className="p-2 border rounded" placeholder="Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="p-2 border rounded" placeholder="Specialty" value={form.specialty} onChange={(e) => setForm(f => ({ ...f, specialty: e.target.value }))} />
            <input className="p-2 border rounded" placeholder="Hospital ID" value={form.hospital_id} onChange={(e) => setForm(f => ({ ...f, hospital_id: e.target.value }))} />
          </div>
        </ModalForm>
      </div>
    </Layout>
  );
};

export default Doctors;
