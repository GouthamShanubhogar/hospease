import React from 'react';

const Table = ({ columns, data, loading = false }) => {
  if (loading) {
    return (
      <div className="overflow-x-auto bg-white shadow-card rounded-xl">
        <div className="p-12 text-center">
          <div className="spinner mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="overflow-x-auto bg-white shadow-card rounded-xl">
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow-card rounded-xl animate-fade-in">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {col.title}
              </th>
            ))}
            {columns.some(c => c.actions) && (
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, idx) => (
            <tr 
              key={row.id || idx} 
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              {columns.map((col) => (
                <td 
                  key={col.key} 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {columns.some(c => c.actions) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {columns.find(c => c.actions)?.actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

