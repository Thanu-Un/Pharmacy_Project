import React, { useState, useEffect } from 'react';

export default function PatientList({ onAddClick, onEditClick }) {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [patientToDelete, setPatientToDelete] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/operation/patients');
            if (!response.ok) throw new Error('Failed to fetch patients');
            const data = await response.json();
            setPatients(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/operation/patients/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete patient');
            setPatients(patients.filter(p => p.id !== id));
            setPatientToDelete(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredPatients = patients.filter(p => {
        const term = searchTerm.toLowerCase();
        return (
            p.code?.toLowerCase().includes(term) ||
            p.name?.toLowerCase().includes(term) ||
            p.phone?.toLowerCase().includes(term) ||
            p.emailAddress?.toLowerCase().includes(term) ||
            p.city?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage registered patients and profiles</p>
                </div>
                <button
                    onClick={onAddClick}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm shadow-emerald-500/10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Patient
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by code, name, phone, email, or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-6 text-center text-rose-600">
                        <p className="font-semibold">Error: {error}</p>
                        <button onClick={fetchPatients} className="mt-2 text-sm text-emerald-600 underline">Try again</button>
                    </div>
                )}

                {isLoading ? (
                    <div className="p-12 text-center text-slate-500">
                        <svg className="animate-spin h-8 w-8 text-emerald-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Loading patients...</span>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h10M7 3h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>
                        <p className="text-lg font-bold text-slate-700">No Patients Found</p>
                        <p className="text-sm text-slate-400 mt-1">Try another search or add a new patient.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">City</th>
                                    <th className="px-6 py-4">Address</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{patient.code}</td>
                                        <td className="px-6 py-4">{patient.name}</td>
                                        <td className="px-6 py-4 font-medium text-slate-600">{patient.phone}</td>
                                        <td className="px-6 py-4 text-slate-500">{patient.emailAddress || '—'}</td>
                                        <td className="px-6 py-4 text-slate-500">{patient.city || '—'}</td>
                                        <td className="px-6 py-4 text-slate-500 max-w-[220px] truncate" title={patient.address}>{patient.address || '—'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onEditClick(patient)}
                                                title="Edit Patient"
                                                className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors mr-2 border border-indigo-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => setPatientToDelete(patient.id)}
                                                title="Delete Patient"
                                                className="text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-md transition-colors border border-rose-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                            {patientToDelete === patient.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-lg rounded-lg p-3 z-50 text-left">
                                                    <p className="text-slate-800 font-medium mb-2 text-sm">Delete this patient?</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleDelete(patient.id)}
                                                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium py-2 rounded-lg"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={() => setPatientToDelete(null)}
                                                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 rounded-lg"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
