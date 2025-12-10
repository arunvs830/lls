import React, { useState, useEffect } from 'react';
import { getPrograms, createProgram, getAcademicYears } from '../services/api';
import { Plus, BookOpen, Calendar } from 'lucide-react';

const Programs = () => {
    const [programs, setPrograms] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        program_name: '',
        description: '',
        duration_months: '',
        semester: 1,
        academic_year_id: ''
    });

    useEffect(() => {
        loadPrograms();
        loadAcademicYears();
    }, []);

    const loadPrograms = async () => {
        const data = await getPrograms();
        setPrograms(data);
    };

    const loadAcademicYears = async () => {
        const data = await getAcademicYears();
        setAcademicYears(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createProgram({
            ...formData,
            academic_year_id: formData.academic_year_id ? parseInt(formData.academic_year_id) : null,
            semester: parseInt(formData.semester),
            duration_months: formData.duration_months ? parseInt(formData.duration_months) : null
        });
        setShowModal(false);
        loadPrograms();
        setFormData({
            program_name: '',
            description: '',
            duration_months: '',
            semester: 1,
            academic_year_id: ''
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    <Plus size={20} className="mr-2" />
                    Add New Program
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {programs.map((program) => (
                    <div key={program.program_id} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center mb-2">
                                <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{program.program_name}</h3>
                            </div>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">{program.description}</p>

                            <div className="mt-4 space-y-2">
                                {program.academic_year_name && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>Academic Year: <strong>{program.academic_year_name}</strong></span>
                                    </div>
                                )}
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="font-medium">Semester:</span>
                                    <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                                        {program.semester}
                                    </span>
                                </div>
                                {program.duration_months && (
                                    <span className="text-sm font-medium text-gray-500">
                                        Duration: {program.duration_months} months
                                    </span>
                                )}
                            </div>

                            <div className="mt-3">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${program.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {program.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {programs.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No programs</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new program.</p>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Add Program</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Academic Year *</label>
                                    <select
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.academic_year_id}
                                        onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
                                    >
                                        <option value="">Select Academic Year</option>
                                        {academicYears.map((year) => (
                                            <option key={year.academic_year_id} value={year.academic_year_id}>
                                                {year.year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Program Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., BCA, BCom, MCA"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.program_name}
                                        onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        placeholder="Brief description of the program"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Semester *</label>
                                    <select
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                            <option key={sem} value={sem}>
                                                Semester {sem}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (Months)</label>
                                    <input
                                        type="number"
                                        placeholder="Optional"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.duration_months}
                                        onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
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

export default Programs;
