import React from 'react';
import { FaListAlt, FaAtlassian, FaLink, FaSignOutAlt } from 'react-icons/fa';

function Sidebar({ page, setPage }) {
  const getButtonClasses = (buttonPage) => {
    return `w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-3 ${
      page === buttonPage
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    }`;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  return (
    // --- MODIFIED: New styles for a full-height sidebar ---
    <aside className="w-64 bg-white flex flex-col flex-shrink-0 border-r border-gray-200">
      <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Menu</h2>
          <nav className="space-y-4">
            <button
              onClick={() => setPage('todo')}
              className={getButtonClasses('todo')}
            >
              <FaListAlt /> <span>To-Do List</span>
            </button>
            <button
              onClick={() => setPage('atlassian')}
              className={getButtonClasses('atlassian')}
            >
              <FaAtlassian /> <span>Atlassian</span>
            </button>
            <button
              onClick={() => setPage('connections')}
              className={getButtonClasses('connections')}
            >
              <FaLink /> <span>Connections</span>
            </button>
          </nav>
      </div>
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors bg-red-500 text-white hover:bg-red-600 flex items-center space-x-3"
        >
          <FaSignOutAlt /> <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;