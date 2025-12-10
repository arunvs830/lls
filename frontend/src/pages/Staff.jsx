import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, User, Lock, CheckCircle, XCircle } from 'lucide-react';

const Staff = () => {
    const [staffList, setStaffList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        qualifications: ''
    });

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        const response = await api.get('/staff/staff');
        setStaffList(response.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/staff/staff', formData);
        setShowModal(false);
        loadStaff();
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            qualifications: ''
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <User className="h-8 w-8 text-indigo-600 mr-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    <Plus size={20} className="mr-2" />
                    Add New Staff
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualifications</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {staffList.length > 0 ? (
                            staffList.map((staff) => (
                                <tr key={staff.staff_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 font-medium text-sm">
                                                    {staff.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-3 text-sm font-medium text-gray-900">{staff.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.phone || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.qualifications || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {staff.has_password ? (
                                            <span className="flex items-center text-green-600 text-sm">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Set
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-500 text-sm">
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Not Set
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {staff.status || 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <User className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new staff member.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Staff Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Add Staff</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full name"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="email@example.com"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        <span className="flex items-center">
                                            <Lock className="h-4 w-4 mr-1" />
                                            Password *
                                        </span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Assign a password for login"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">This password will be used by staff to login</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="text"
                                        placeholder="Phone number"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                                    <textarea
                                        placeholder="e.g., M.A. German, B.Ed"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.qualifications}
                                        onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
