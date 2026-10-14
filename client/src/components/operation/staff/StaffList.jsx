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

  const currentUsername = localStorage.getItem('username');

  const filteredUsers = users.filter(u => {
    if (u.role?.name === 'OWNER' && currentUsername !== 'owner') {
      return false;
    }

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">User Access & Staff Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Role assignments, operator authentication, and credential access</p>
        </div>
        <button
          onClick={onAddClick}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Staff Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden mb-6">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search username, name, role, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4 text-center">System Role</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">Loading registered staff accounts...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-rose-500 font-medium">⚠️ {error}</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">No registered staff members found.</td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
                  const roleName = user.role?.name || 'USER';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
                          {user.username}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{fullName}</td>
                      <td className="py-3 px-4 text-slate-500">{user.gender || '—'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          roleName === 'OWNER' ? 'bg-purple-50 text-purple-700 border-purple-200/60' :
                          roleName === 'ADMIN' ? 'bg-sky-50 text-sky-700 border-sky-200/60' :
                          roleName === 'PHARMACIST' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            roleName === 'OWNER' ? 'bg-purple-500' :
                            roleName === 'ADMIN' ? 'bg-sky-500' :
                            roleName === 'PHARMACIST' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}></span>
                          {roleName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{user.phone || '—'}</td>
                      <td className="py-3 px-4 text-slate-500">{user.email || '—'}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onEditClick(user)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors mr-1"
                          title="Edit Staff Account"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Staff Account"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Revoke Staff Account</h3>
            <p className="text-slate-600 text-xs mb-6 leading-relaxed">
              Are you sure you want to delete staff account <strong className="font-semibold text-slate-900">{userToDelete.username}</strong>? This user will immediately lose access.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(userToDelete.id)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Revoke Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
