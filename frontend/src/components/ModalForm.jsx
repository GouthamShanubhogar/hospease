import React from 'react';

const ModalForm = ({ open, title, children, onClose, onSave, loading = false }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-large w-full max-w-2xl mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            {/* close icon removed */}
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            onClick={onSave} 
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-gradient-blue text-white font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                {/* spinner removed */}
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;

