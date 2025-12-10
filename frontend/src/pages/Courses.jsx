import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, createCourse, getPrograms, getStaff, getStaffCourses, getAcademicYears } from '../services/api';
import { Plus, BookOpen, User, GraduationCap, ExternalLink, Filter } from 'lucide-react';

const Courses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [staff, setStaff] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        course_name: '',
        description: '',
        credits: '',
        staff_id: '',
        program_ids: []
    });

    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';
    const isStaff = user?.role === 'staff';

    useEffect(() => {
        loadAcademicYears();
        loadPrograms();
        loadStaff();
    }, []);

    // Load courses when filter changes
    useEffect(() => {
        loadCourses();
    }, [selectedAcademicYear]);

    const loadCourses = async () => {
        // Staff members only see their assigned courses (no filter for staff)
        if (isStaff && user?.user_id) {
            const data = await getStaffCourses(user.user_id);
            setCourses(data);
        } else {
            // Admin sees courses filtered by academic year
            const academicYearId = selectedAcademicYear ? parseInt(selectedAcademicYear) : null;
            const data = await getCourses(academicYearId);
            setCourses(data);
        }
    };

    const loadAcademicYears = async () => {
        const data = await getAcademicYears();
        setAcademicYears(data);
    };

    const loadPrograms = async () => {
        const data = await getPrograms();
        setPrograms(data);
    };

    const loadStaff = async () => {
        const data = await getStaff();
        setStaff(data);
    };

    const handleProgramToggle = (programId) => {
        setFormData(prev => {
            const exists = prev.program_ids.includes(programId);
            if (exists) {
                return { ...prev, program_ids: prev.program_ids.filter(id => id !== programId) };
            } else {
                return { ...prev, program_ids: [...prev.program_ids, programId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createCourse({
            ...formData,
            credits: formData.credits ? parseInt(formData.credits) : null,
            staff_id: formData.staff_id ? parseInt(formData.staff_id) : null
        });
        setShowModal(false);
        loadCourses();
        setFormData({
            course_name: '',
            description: '',
            credits: '',
            staff_id: '',
            program_ids: []
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isStaff ? 'My Courses' : 'Courses'}
                </h1>
                <div className="flex items-center space-x-4">
                    {/* Academic Year Filter - Only for Admin */}
                    {isAdmin && (
                        <div className="flex items-center space-x-2">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <select
                                value={selectedAcademicYear}
                                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Academic Years</option>
                                {academicYears.map((year) => (
                                    <option key={year.academic_year_id} value={year.academic_year_id}>
                                        {year.year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {/* Only admin can add new courses */}
                    {isAdmin && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            <Plus size={20} className="mr-2" />
                            Add New Course
                        </button>
                    )}
                </div>
            </div>

            {/* Course Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <div key={course.course_id} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center mb-2">
                                <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{course.course_name}</h3>
                            </div>

                            {course.description && (
                                <p className="mt-1 text-sm text-gray-500">{course.description}</p>
                            )}

                            <div className="mt-4 space-y-2">
                                {/* Teacher */}
                                {course.teacher_name && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <User className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>Teacher: <strong>{course.teacher_name}</strong></span>
                                    </div>
                                )}

                                {/* Credits */}
                                {course.credits && (
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Credits:</span>
                                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                            {course.credits}
                                        </span>
                                    </div>
                                )}

                                {/* Linked Programs */}
                                {course.linked_programs && course.linked_programs.length > 0 && (
                                    <div className="mt-3">
                                        <div className="flex items-center text-sm text-gray-600 mb-1">
                                            <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="font-medium">Linked Programs:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 ml-6">
                                            {course.linked_programs.map((prog, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                                    {prog.program_name} (Sem {prog.semester})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {course.status}
                                </span>
                                <button
                                    onClick={() => navigate(`/courses/${course.course_id}`)}
                                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    Manage Course
                                    <ExternalLink className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {courses.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
                </div>
            )}

            {/* Add Course Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Add Course</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Course Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., German A1, French B1"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.course_name}
                                        onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        placeholder="Brief description of the course"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Credits</label>
                                    <input
                                        type="number"
                                        placeholder="Number of credits"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.credits}
                                        onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Teacher/Tutor *</label>
                                    <select
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.staff_id}
                                        onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                                    >
                                        <option value="">Select Teacher</option>
                                        {staff.map((s) => (
                                            <option key={s.staff_id} value={s.staff_id}>
                                                {s.name} ({s.email})
                                            </option>
                                        ))}
                                    </select>
                                    {staff.length === 0 && (
                                        <p className="mt-1 text-sm text-red-500">No staff available. Please add staff first.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link to Programs (select one or more)
                                    </label>
                                    <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                                        {programs.length === 0 ? (
                                            <p className="text-sm text-gray-500">No programs available. Create programs first.</p>
                                        ) : (
                                            programs.map((prog) => (
                                                <label key={prog.program_id} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.program_ids.includes(prog.program_id)}
                                                        onChange={() => handleProgramToggle(prog.program_id)}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-700">
                                                        {prog.program_name} - Semester {prog.semester}
                                                        {prog.academic_year_name && ` (${prog.academic_year_name})`}
                                                    </span>
                                                </label>
                                            ))
                                        )}
                                    </div>
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

export default Courses;
