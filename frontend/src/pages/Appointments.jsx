import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import ModalForm from '../components/ModalForm';
import api from '../services/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', date: '', time: '' });

  useEffect(() => {
    api.get('/api/appointments').then(res => setAppointments(res.data || [])).catch(() => {});
    api.get('/api/doctors').then(res => setDoctors(res.data || [])).catch(() => {});
    api.get('/api/patients').then(res => setPatients(res.data || [])).catch(() => {});
  }, []);

  const columns = [
    { key: 'token_number', title: 'Token' },
    { key: 'patient_name', title: 'Patient' },
    { key: 'doctor_name', title: 'Doctor' },
    { key: 'appointment_date', title: 'Date' },
    { key: 'status', title: 'Status' },
  ];

  const handleSave = async () => {
    try {
      await api.post('/api/appointments', form);
      const res = await api.get('/api/appointments');
      setAppointments(res.data || []);
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Appointments</h2>
          <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Book Appointment</button>
        </div>

        <div>
          <Table columns={columns} data={appointments} />
        </div>

        <ModalForm open={open} title="Book Appointment" onClose={() => setOpen(false)} onSave={handleSave}>
          <div className="grid grid-cols-1 gap-3">
            <select value={form.patient_id} onChange={(e) => setForm(f => ({ ...f, patient_id: e.target.value }))} className="p-2 border rounded">
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.user_id} value={p.user_id}>{p.name}</option>)}
            </select>
            <select value={form.doctor_id} onChange={(e) => setForm(f => ({ ...f, doctor_id: e.target.value }))} className="p-2 border rounded">
              <option value="">Select Doctor</option>
              {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.name}</option>)}
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="p-2 border rounded" />
            <input type="time" value={form.time} onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))} className="p-2 border rounded" />
          </div>
        </ModalForm>
      </div>
    </Layout>
  );
};

export default Appointments;
