// components/DataGrid.jsx
import React from 'react';
import { Edit3, Trash2, Plus, Loader2 } from 'lucide-react';

const DataGrid = ({
  data,
  title,
  columns,
  actions = [],
  loading = false,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onAdd,
  searchTerm,
  onSearchChange,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading {title.toLowerCase()}...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your {title.toLowerCase()}</p>
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-3 transition-all duration-200 hover:scale-[0.98] shadow-lg shadow-blue-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Add {title.slice(0, -1)}</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide"
                >
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || actions.length > 0) && (
                <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map((item, index) => (
              <tr 
                key={item._id || item.id || index} 
                className="border-b border-gray-50 hover:bg-gray-50 transition-all duration-200"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-8 py-6 text-sm text-gray-900">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete || actions.length > 0) && (
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(item)}
                          className={`p-2 rounded-xl hover:bg-${action.color}-50 transition-all duration-200 text-${action.color}-600 hover:text-${action.color}-900 hover:scale-110`}
                          title={action.label}
                        >
                          <action.icon className="w-4 h-4" />
                        </button>
                      ))}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 rounded-xl text-blue-600 hover:text-blue-900 hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item._id || item.id, title.toLowerCase().slice(0, -1))}
                          className="p-2 rounded-xl text-red-600 hover:text-red-900 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {title.toLowerCase()} found
            </h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : `Get started by creating your first ${title.toLowerCase().slice(0, -1)}.`}
            </p>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {data.length} of {pagination.totalItems || pagination.totalOrders} {title.toLowerCase()}
            </p>
            <div className="flex items-center gap-4">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => onPageChange(pagination.currentPage - 1)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-200"
              >
                Previous
              </button>
              <span className="text-sm font-semibold text-gray-900">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => onPageChange(pagination.currentPage + 1)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataGrid;