import React, { useState, useEffect } from 'react';
import { getPrograms, getCourses, getStaffCourses, getStudents, getStaffStudents } from '../services/api';
import { Search, Users, Filter } from 'lucide-react';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');

    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';
    const isStaff = user?.role === 'staff';

    useEffect(() => {
        loadCourses();
        if (isAdmin) {
            loadPrograms();
        }
    }, []);

    // Load students when course filter changes
    useEffect(() => {
        loadStudents();
    }, [selectedCourse]);

    // Filter students locally when search or program changes
    useEffect(() => {
        filterStudentsLocally();
    }, [students, searchTerm, selectedProgram]);

    const loadStudents = async () => {
        const courseId = selectedCourse ? parseInt(selectedCourse) : null;

        if (isStaff && user?.user_id) {
            // Staff: Get only students in their courses
            const data = await getStaffStudents(user.user_id, courseId);
            setStudents(data);
            setFilteredStudents(data);
        } else {
            // Admin: Get all students (optionally filtered by course)
            const data = await getStudents(courseId);
            setStudents(data);
            setFilteredStudents(data);
        }
    };

    const loadPrograms = async () => {
        const data = await getPrograms();
        setPrograms(data);
    };

    const loadCourses = async () => {
        if (isStaff && user?.user_id) {
            // Staff: Only see their assigned courses
            const data = await getStaffCourses(user.user_id);
            setCourses(data);
        } else {
            // Admin: See all courses
            const data = await getCourses();
            setCourses(data);
        }
    };

    const filterStudentsLocally = () => {
        let result = students;

        // Filter by search term (name or email)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(term) ||
                s.email.toLowerCase().includes(term)
            );
        }

        // Filter by program (admin only, since course filter already restricts for staff)
        if (selectedProgram && isAdmin) {
            result = result.filter(s => s.program_id === parseInt(selectedProgram));
        }

        setFilteredStudents(result);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedProgram('');
        setSelectedCourse('');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Users className="h-8 w-8 text-indigo-600 mr-3" />
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isStaff ? 'My Students' : 'Students'}
                    </h1>
                </div>
                <div className="text-sm text-gray-500">
                    Showing {filteredStudents.length} of {students.length} students
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="flex items-center mb-4">
                    <Filter className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Search & Filter</span>
                </div>

                <div className={`grid grid-cols-1 gap-4 ${isAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Program Filter - Admin Only */}
                    {isAdmin && (
                        <div>
                            <select
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                            >
                                <option value="">All Programs</option>
                                {programs.map((prog) => (
                                    <option key={prog.program_id} value={prog.program_id}>
                                        {prog.program_name} - Sem {prog.semester}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Course Filter */}
                    <div>
                        <select
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">{isStaff ? 'All My Courses' : 'All Courses'}</option>
                            {courses.map((course) => (
                                <option key={course.course_id} value={course.course_id}>
                                    {course.course_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters Button */}
                    <div>
                        <button
                            onClick={clearFilters}
                            className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.student_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 font-medium text-sm">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {student.program_name ? (
                                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                                {student.program_name}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">Not enrolled</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.contact || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {students.length === 0
                                            ? 'No students have registered yet.'
                                            : 'Try adjusting your search or filter criteria.'}
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Students;
