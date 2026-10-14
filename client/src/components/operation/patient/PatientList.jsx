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
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Patient Registry</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Clinical profiles, medical records, and contact directory</p>
                </div>
                <button
                    onClick={onAddClick}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Register Patient
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
                <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-sm">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search patient code, name, phone, city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {error && (
                    <div className="m-4 bg-rose-50 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-rose-200/60">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error}</span>
                        <button onClick={fetchPatients} className="ml-auto text-sky-600 underline font-medium">Retry</button>
                    </div>
                )}

                {isLoading ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                        <svg className="animate-spin h-6 w-6 text-sky-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Loading patient directory...</span>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                        <p className="font-semibold text-slate-700 text-sm">No Patients Found</p>
                        <p className="text-slate-400 mt-1">Try another search or register a new patient.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                                    <th className="py-3 px-4">Code</th>
                                    <th className="py-3 px-4">Patient Name</th>
                                    <th className="py-3 px-4">Contact Phone</th>
                                    <th className="py-3 px-4">Email Address</th>
                                    <th className="py-3 px-4">Location</th>
                                    <th className="py-3 px-4">Residential Address</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors group">
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
                                                {patient.code}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-900">{patient.name}</td>
                                        <td className="py-3 px-4 font-mono text-slate-600">{patient.phone || '—'}</td>
                                        <td className="py-3 px-4 text-slate-500">{patient.emailAddress || '—'}</td>
                                        <td className="py-3 px-4 text-slate-500">{patient.city || '—'}</td>
                                        <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate" title={patient.address}>{patient.address || '—'}</td>
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => onEditClick(patient)}
                                                title="Edit Patient"
                                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors mr-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => setPatientToDelete(patient.id)}
                                                title="Delete Patient"
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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
