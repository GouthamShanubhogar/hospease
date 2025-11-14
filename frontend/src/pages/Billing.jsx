import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/api/billing')
      .then(res => {
        if (!mounted) return;
        setInvoices(res.data || [
          { 
            id: 1, 
            invoiceNumber: 'INV-2024-001', 
            date: 'December 15, 2024', 
            dueDate: 'December 30, 2024',
            patientName: 'John Doe',
            patientId: 'PAT-12345',
            room: '204 - ICU',
            services: [
              { description: 'Room Charges (ICU)', quantity: 3, unitPrice: 500, amount: 1500 },
              { description: 'Consultation Fee', quantity: 2, unitPrice: 150, amount: 300 },
              { description: 'Laboratory Tests', quantity: 5, unitPrice: 80, amount: 400 },
              { description: 'Medications', quantity: 1, unitPrice: 250, amount: 250 },
              { description: 'Surgery', quantity: 1, unitPrice: 3000, amount: 3000 },
            ],
            subtotal: 5450,
            tax: 545,
            total: 5995,
            status: 'Pending'
          }
        ]);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
          <button 
            onClick={() => handleViewInvoice(invoices[0])}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span>📄</span> Generate Invoice
          </button>
        </div>

        {/* Invoice Preview */}
        {invoices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-200">
              <div>
                <h2 className="text-4xl font-bold text-blue-600 mb-2">INVOICE</h2>
                <p className="text-gray-600">Hospease Hospital</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p><strong>Invoice #:</strong> {invoices[0].invoiceNumber}</p>
                <p><strong>Date:</strong> {invoices[0].date}</p>
                <p><strong>Due Date:</strong> {invoices[0].dueDate}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
              <p className="text-gray-700"><strong>Name:</strong> {invoices[0].patientName}</p>
              <p className="text-gray-700"><strong>Patient ID:</strong> {invoices[0].patientId}</p>
              <p className="text-gray-700"><strong>Room:</strong> {invoices[0].room}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Charges</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices[0].services.map((service, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-900">{service.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{service.quantity} {service.quantity > 1 ? 'days' : 'day'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">${service.unitPrice}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">${service.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700">Subtotal:</span>
                <span className="text-gray-900 font-semibold">${invoices[0].subtotal}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700">Tax (10%):</span>
                <span className="text-gray-900 font-semibold">${invoices[0].tax}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                <span className="text-2xl font-bold text-blue-600">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">${invoices[0].total}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-start justify-between pb-6 border-b border-gray-200">
                <div>
                  <h3 className="text-3xl font-bold text-blue-600 mb-2">INVOICE</h3>
                  <p className="text-gray-600">Hospease Hospital</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p><strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}</p>
                  <p><strong>Date:</strong> {selectedInvoice.date}</p>
                  <p><strong>Due Date:</strong> {selectedInvoice.dueDate}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
                <p className="text-gray-700"><strong>Name:</strong> {selectedInvoice.patientName}</p>
                <p className="text-gray-700"><strong>Patient ID:</strong> {selectedInvoice.patientId}</p>
                <p className="text-gray-700"><strong>Room:</strong> {selectedInvoice.room}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Services</h4>
                <div className="space-y-2">
                  {selectedInvoice.services.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">{service.description}</span>
                      <span className="font-semibold text-gray-900">${service.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${selectedInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax (10%):</span>
                  <span className="font-semibold">${selectedInvoice.tax}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold text-blue-600">Total:</span>
                  <span className="text-lg font-bold text-blue-600">${selectedInvoice.total}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold">
                  Print Invoice
                </button>
                <button className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Billing;
