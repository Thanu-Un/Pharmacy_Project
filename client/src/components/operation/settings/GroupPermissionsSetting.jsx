import React, { useState, useEffect } from 'react';

const MODULE_PERMISSIONS = [
  {
    module: 'Dashboard',
    items: [
      { id: 'dashboard_view', label: 'View Dashboard & Statistics' }
    ]
  },
  {
    module: 'Categories',
    items: [
      { id: 'category_view', label: 'View Categories List' },
      { id: 'category_add', label: 'Add Category' },
      { id: 'category_edit', label: 'Edit Category' },
      { id: 'category_delete', label: 'Delete Category' }
    ]
  },
  {
    module: 'Units',
    items: [
      { id: 'unit_view', label: 'View Units List' },
      { id: 'unit_add', label: 'Add Unit' },
      { id: 'unit_edit', label: 'Edit Unit' },
      { id: 'unit_delete', label: 'Delete Unit' }
    ]
  },
  {
    module: 'Medicines',
    items: [
      { id: 'medicine_view', label: 'View Medicines List' },
      { id: 'medicine_add', label: 'Add Medicine' },
      { id: 'medicine_edit', label: 'Edit Medicine' },
      { id: 'medicine_delete', label: 'Delete Medicine' },
      { id: 'medicine_import', label: 'Import Medicines' },
      { id: 'medicine_barcode', label: 'Print Barcode/Labels' }
    ]
  },
  {
    module: 'Stock In / Purchases',
    items: [
      { id: 'purchase_view', label: 'View Purchases List' },
      { id: 'purchase_add', label: 'Add Purchase' },
      { id: 'purchase_edit', label: 'Edit Purchase' },
      { id: 'purchase_delete', label: 'Delete Purchase' }
    ]
  },
  {
    module: 'Dispensing (POS) & Sales',
    items: [
      { id: 'pos_access', label: 'Access POS Cashier' },
      { id: 'pos_sales_view', label: 'View Sales History' },
      { id: 'pos_discount', label: 'Allow Custom Discounts' },
      { id: 'pos_sale_delete', label: 'Delete Recorded Sale' }
    ]
  },
  {
    module: 'Suppliers',
    items: [
      { id: 'supplier_view', label: 'View Suppliers List' },
      { id: 'supplier_add', label: 'Add Supplier' },
      { id: 'supplier_edit', label: 'Edit Supplier' },
      { id: 'supplier_delete', label: 'Delete Supplier' }
    ]
  },
  {
    module: 'Patients',
    items: [
      { id: 'patient_view', label: 'View Patients List' },
      { id: 'patient_add', label: 'Add Patient' },
      { id: 'patient_edit', label: 'Edit Patient' },
      { id: 'patient_delete', label: 'Delete Patient' }
    ]
  },
  {
    module: 'Staff Accounts',
    items: [
      { id: 'staff_view', label: 'View Staff Accounts' },
      { id: 'staff_register', label: 'Register New Staff Account' },
      { id: 'staff_edit', label: 'Edit Staff Account' },
      { id: 'staff_delete', label: 'Delete Staff Account' }
    ]
  },
  {
    module: 'Settings',
    items: [
      { id: 'setting_payment', label: 'Manage Payment Methods' },
      { id: 'setting_currency', label: 'Manage Currency & Rates' },
      { id: 'setting_permissions', label: 'Manage Group Permissions' }
    ]
  },
  {
    module: 'Expenses',
    items: [
      { id: 'expense_view', label: 'View Expenses List' },
      { id: 'expense_add', label: 'Add Expense' },
      { id: 'expense_edit', label: 'Edit Expense' },
      { id: 'expense_delete', label: 'Delete Expense' }
    ]
  },
  {
    module: 'Reports & Analytics',
    items: [
      { id: 'report_view', label: 'View Business Reports' }
    ]
  }
];

export default function GroupPermissionsSetting() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    selectedPermissions: []
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      let perms = [];
      try {
        perms = role.permissions ? JSON.parse(role.permissions) : [];
      } catch (e) {
        perms = role.permissions ? role.permissions.split(',') : [];
      }
      setRoleForm({
        name: role.name || '',
        description: role.description || '',
        selectedPermissions: perms
      });
    } else {
      setEditingRole(null);
      setRoleForm({
        name: '',
        description: '',
        selectedPermissions: ['dashboard_view', 'pos_access', 'medicine_view']
      });
    }
    setShowModal(true);
  };

  const handleTogglePermission = (permId) => {
    setRoleForm(prev => {
      const exists = prev.selectedPermissions.includes(permId);
      if (exists) {
        return {
          ...prev,
          selectedPermissions: prev.selectedPermissions.filter(p => p !== permId)
        };
      } else {
        return {
          ...prev,
          selectedPermissions: [...prev.selectedPermissions, permId]
        };
      }
    });
  };

  const handleSelectAllModule = (moduleItems) => {
    const itemIds = moduleItems.map(i => i.id);
    setRoleForm(prev => {
      const allSelected = itemIds.every(id => prev.selectedPermissions.includes(id));
      if (allSelected) {
        return {
          ...prev,
          selectedPermissions: prev.selectedPermissions.filter(id => !itemIds.includes(id))
        };
      } else {
        const combined = new Set([...prev.selectedPermissions, ...itemIds]);
        return {
          ...prev,
          selectedPermissions: Array.from(combined)
        };
      }
    });
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;

    try {
      const url = editingRole ? `/api/auth/roles/${editingRole.id}` : '/api/auth/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roleForm.name,
          description: roleForm.description,
          permissions: JSON.stringify(roleForm.selectedPermissions)
        })
      });

      if (res.ok) {
        setShowModal(false);
        fetchRoles();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this permission group?')) return;
    try {
      const res = await fetch(`/api/auth/roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRoles();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Group Permissions & Roles</h1>
          <p className="text-sm text-slate-500 mt-1">Configure user group roles and access permission levels for staff members</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm self-start md:self-auto text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Permission Group
        </button>
      </div>

      {/* Roles List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Permission Groups ({roles.length})</span>
          <button
            onClick={fetchRoles}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-100 font-medium transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-[#00a65a] text-white text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Role / Group Name</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Permissions Count</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400">Loading permission groups...</td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400">No permission groups defined yet.</td>
                </tr>
              ) : (
                roles.map(role => {
                  let permCount = 0;
                  try {
                    permCount = role.permissions ? JSON.parse(role.permissions).length : 0;
                  } catch (e) {
                    permCount = role.permissions ? role.permissions.split(',').length : 0;
                  }

                  return (
                    <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        <span className={`text-xs px-3 py-1 rounded font-bold uppercase tracking-wider ${
                          role.name === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          role.name === 'PHARMACIST' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          role.name === 'CASHIER' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {role.name}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 text-sm">{role.description || 'No description provided'}</td>
                      <td className="p-3 text-center">
                        <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-full text-xs">
                          {permCount} permissions granted
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(role)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Permissions"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Group"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingRole ? `Edit Group Permissions: ${editingRole.name}` : 'Add New Permission Group'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Group / Role Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PHARMACIST, CASHIER, SUPERVISOR"
                    value={roleForm.name}
                    onChange={e => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of access privileges..."
                    value={roleForm.description}
                    onChange={e => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Module Permissions Checklist
                </h4>

                <div className="space-y-4">
                  {MODULE_PERMISSIONS.map(mod => {
                    const allSelected = mod.items.every(i => roleForm.selectedPermissions.includes(i.id));

                    return (
                      <div key={mod.module} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                          <span className="font-bold text-sm text-slate-800">{mod.module}</span>
                          <button
                            type="button"
                            onClick={() => handleSelectAllModule(mod.items)}
                            className="text-xs text-emerald-700 font-semibold hover:underline"
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {mod.items.map(item => {
                            const checked = roleForm.selectedPermissions.includes(item.id);
                            return (
                              <label key={item.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleTogglePermission(item.id)}
                                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className={checked ? 'font-semibold text-slate-900' : ''}>{item.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-semibold shadow-sm"
                >
                  Save Group Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
