import React, { useState, useEffect } from 'react';

export default function StaffList({ onAddClick, onEditClick }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/users');
      if (!response.ok) throw new Error('Failed to fetch registered staff accounts');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/auth/users/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete staff account');
      setUsers(users.filter(u => u.id !== id));
      setUserToDelete(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    return (
      u.username?.toLowerCase().includes(term) ||
      fullName.includes(term) ||
      u.phone?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage registered user login accounts, roles, and credentials</p>
        </div>
        <button
          onClick={onAddClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm self-start md:self-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add User
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by username, full name, role, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-100 font-medium transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-[#00a65a] text-white text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Gender</th>
                <th className="p-3">Role</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">Loading registered staff accounts...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-rose-500 font-medium">⚠️ {error}</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">No registered staff members found.</td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
                  const roleName = user.role?.name || 'USER';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 font-mono text-xs">{user.username}</td>
                      <td className="p-3 font-medium text-slate-800">{fullName}</td>
                      <td className="p-3 text-slate-600">{user.gender || '-'}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                          roleName === 'ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          roleName === 'PHARMACIST' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          roleName === 'CASHIER' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {roleName}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{user.phone || '-'}</td>
                      <td className="p-3 text-slate-600">{user.email || '-'}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditClick(user)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Staff Account"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Staff Account"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Staff Account</h3>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to delete staff user account <strong>{userToDelete.username}</strong>? This action will remove their login access.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(userToDelete.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm font-semibold"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
