import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const Wards = () => {
  const [wards, setWards] = useState([]);

  useEffect(() => {
    api.get('/api/wards').then(res => setWards(res.data || [])).catch(() => {});
  }, []);

  const toggleBed = async (wardId, bedId, occupied) => {
    try {
      await api.put(`/api/wards/${wardId}/beds/${bedId}`, { occupied: !occupied });
      const res = await api.get('/api/wards');
      setWards(res.data || []);
    } catch (err) { console.error(err); }
  };

  return (
    <Layout>
      <div>
        <h2 className="text-xl font-semibold mb-4">Wards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wards.map(w => (
            <div key={w.ward_id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">{w.name}</h3>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {w.beds && w.beds.map(b => (
                  <button key={b.bed_id} onClick={() => toggleBed(w.ward_id, b.bed_id, b.occupied)} className={`p-2 rounded ${b.occupied ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    Bed {b.number}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Wards;
