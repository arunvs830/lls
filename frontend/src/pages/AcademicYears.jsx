import React, { useState, useEffect } from 'react';
import { getAcademicYears, createAcademicYear } from '../services/api';
import { Plus } from 'lucide-react';

const AcademicYears = () => {
    const [years, setYears] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ year: '', start_date: '', end_date: '' });

    useEffect(() => {
        loadYears();
    }, []);

    const loadYears = async () => {
        const data = await getAcademicYears();
        setYears(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createAcademicYear(formData);
        setShowModal(false);
        loadYears();
        setFormData({ year: '', start_date: '', end_date: '' });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Academic Years</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    <Plus size={20} className="mr-2" />
                    Add New
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {years.map((year) => (
                            <tr key={year.academic_year_id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{year.year}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{year.start_date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{year.end_date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${year.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {year.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Add Academic Year</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Year (e.g., 2024-2025)</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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

export default AcademicYears;
