import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerStudent, getPrograms, getProgramCourses } from '../services/api';
import { UserPlus, BookOpen, User, Mail, Phone, Calendar, Lock, Users, GraduationCap } from 'lucide-react';

const StudentRegister = () => {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: '',
        contact: '',
        parent_name: '',
        parent_contact: '',
        parent_email: '',
        course_id: ''
    });

    useEffect(() => {
        loadPrograms();
    }, []);

    // Load courses when program changes
    useEffect(() => {
        if (selectedProgram) {
            loadProgramCourses(selectedProgram);
        } else {
            setCourses([]);
            setFormData(prev => ({ ...prev, course_id: '' }));
        }
    }, [selectedProgram]);

    const loadPrograms = async () => {
        try {
            const data = await getPrograms();
            // Filter only active programs
            setPrograms(data.filter(p => p.status === 'Active'));
        } catch (err) {
            console.error('Error loading programs:', err);
        }
    };

    const loadProgramCourses = async (programId) => {
        setLoadingCourses(true);
        try {
            const data = await getProgramCourses(programId);
            setCourses(data);
            // Reset course selection when program changes
            setFormData(prev => ({ ...prev, course_id: '' }));
        } catch (err) {
            console.error('Error loading courses:', err);
            setCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleProgramChange = (e) => {
        setSelectedProgram(e.target.value);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!formData.course_id) {
            setError('Please select a program and course');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...dataToSend } = formData;
            dataToSend.course_id = dataToSend.course_id ? parseInt(dataToSend.course_id) : null;

            await registerStudent(dataToSend);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Student Registration</h2>
                    <p className="mt-2 text-indigo-200">Create your account to start learning</p>
                </div>

                {/* Registration Form */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-400/50 rounded-lg text-green-200 text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information Section */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Contact Number</label>
                                    <input
                                        type="tel"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                                <Lock className="h-5 w-5 mr-2" />
                                Account Security
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Confirm Password *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                        placeholder="Confirm password"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Program & Course Selection */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                                <GraduationCap className="h-5 w-5 mr-2" />
                                Program & Course Enrollment
                            </h3>

                            <div className="space-y-4">
                                {/* Program Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-2">
                                        Select Program *
                                    </label>
                                    <select
                                        value={selectedProgram}
                                        onChange={handleProgramChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                    >
                                        <option value="" className="text-gray-800">Choose a program</option>
                                        {programs.map((program) => (
                                            <option key={program.program_id} value={program.program_id} className="text-gray-800">
                                                {program.program_name} - Semester {program.semester}
                                                {program.academic_year_name ? ` (${program.academic_year_name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {programs.length === 0 && (
                                        <p className="text-xs text-yellow-300 mt-1">No programs available at the moment</p>
                                    )}
                                </div>

                                {/* Selected Program Info */}
                                {selectedProgram && (
                                    <div className="p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
                                        {(() => {
                                            const prog = programs.find(p => p.program_id === parseInt(selectedProgram));
                                            return prog ? (
                                                <div className="text-sm">
                                                    <p className="text-green-200 font-medium">📚 {prog.program_name}</p>
                                                    {prog.description && (
                                                        <p className="text-green-300/70 text-xs mt-1">{prog.description}</p>
                                                    )}
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="text-xs bg-green-500/30 text-green-200 px-2 py-0.5 rounded">
                                                            Semester {prog.semester}
                                                        </span>
                                                        {prog.academic_year_name && (
                                                            <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded">
                                                                {prog.academic_year_name}
                                                            </span>
                                                        )}
                                                        {prog.duration_months && (
                                                            <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded">
                                                                {prog.duration_months} Months
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                )}

                                {/* Course Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-2">
                                        Select Course *
                                    </label>
                                    <select
                                        name="course_id"
                                        value={formData.course_id}
                                        onChange={handleChange}
                                        disabled={!selectedProgram || loadingCourses}
                                        className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent ${!selectedProgram ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        <option value="" className="text-gray-800">
                                            {!selectedProgram
                                                ? 'First select a program'
                                                : loadingCourses
                                                    ? 'Loading courses...'
                                                    : 'Choose a course'}
                                        </option>
                                        {courses.map((course) => (
                                            <option key={course.course_id} value={course.course_id} className="text-gray-800">
                                                {course.course_name} {course.credits ? `(${course.credits} Credits)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedProgram && courses.length === 0 && !loadingCourses && (
                                        <p className="text-xs text-yellow-300 mt-1">No courses available for this program</p>
                                    )}
                                </div>

                                {/* Selected Course Info */}
                                {formData.course_id && (
                                    <div className="p-3 bg-indigo-500/10 border border-indigo-400/30 rounded-lg">
                                        {(() => {
                                            const course = courses.find(c => c.course_id === parseInt(formData.course_id));
                                            return course ? (
                                                <div className="text-sm">
                                                    <p className="text-indigo-200 font-medium">📖 {course.course_name}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        {course.credits && (
                                                            <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded">
                                                                {course.credits} Credits
                                                            </span>
                                                        )}
                                                        <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded">
                                                            Semester {course.semester}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Parent/Guardian Information */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                                <Users className="h-5 w-5 mr-2" />
                                Parent/Guardian Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Parent Name</label>
                                    <input
                                        type="text"
                                        name="parent_name"
                                        value={formData.parent_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                        placeholder="Parent's name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Parent Contact</label>
                                    <input
                                        type="tel"
                                        name="parent_contact"
                                        value={formData.parent_contact}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                        placeholder="Parent's phone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Parent Email</label>
                                    <input
                                        type="email"
                                        name="parent_email"
                                        value={formData.parent_email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                        placeholder="parent@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-indigo-200">
                            Already have an account?{' '}
                            <Link to="/login" className="text-white font-semibold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRegister;
