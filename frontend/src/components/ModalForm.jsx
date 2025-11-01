import React from 'react';

const ModalForm = ({ open, title, children, onClose, onSave }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100">Cancel</button>
          <button onClick={onSave} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:scale-105 transition-transform">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;
