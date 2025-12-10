import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    BookOpen, Play, FileText, Award, Clock, CheckCircle,
    User, LogOut, ChevronRight, Video, HelpCircle, GraduationCap
} from 'lucide-react';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalLessons: 0,
        completedLessons: 0,
        totalQuizzes: 0,
        totalAssignments: 0
    });

    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || user.role !== 'student') {
            navigate('/login');
            return;
        }
        loadCourseData();
    }, []);

    const loadCourseData = async () => {
        try {
            if (user?.course_id) {
                // Load course details
                const coursesResponse = await api.get('/academic/courses');
                const courseData = coursesResponse.data.find(c => c.course_id === user.course_id);
                setCourse(courseData);

                // Load course materials
                const materialsResponse = await api.get(`/learning/courses/${user.course_id}/materials`);
                setMaterials(materialsResponse.data);

                // Calculate stats
                const totalLessons = materialsResponse.data.length;
                const totalQuizzes = materialsResponse.data.reduce((sum, m) => sum + (m.mcq_count || 0), 0);
                const totalAssignments = materialsResponse.data.reduce((sum, m) => sum + (m.assignment_count || 0), 0);

                setStats({
                    totalLessons,
                    completedLessons: 0, // Would come from progress tracking
                    totalQuizzes,
                    totalAssignments
                });

                if (materialsResponse.data.length > 0) {
                    loadMaterialDetail(materialsResponse.data[0].material_id);
                }
            }
        } catch (error) {
            console.error('Error loading course data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMaterialDetail = async (materialId) => {
        try {
            const response = await api.get(`/learning/materials/${materialId}`);
            setSelectedMaterial(response.data);
        } catch (error) {
            console.error('Error loading material:', error);
        }
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Language Learning System</h1>
                                <p className="text-sm text-indigo-200">Student Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{user?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h2>
                    <p className="text-gray-600 mt-1">Continue your learning journey</p>
                </div>

                {/* Course Card */}
                {course ? (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white mb-8 shadow-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium">Currently Enrolled In</p>
                                <h3 className="text-2xl font-bold mt-1">{course.course_name}</h3>
                                <p className="text-indigo-200 mt-2">{course.description}</p>
                                {course.teacher_name && (
                                    <p className="text-sm mt-3 flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        Instructor: {course.teacher_name}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="bg-white/20 rounded-lg px-4 py-2">
                                    <p className="text-sm">Progress</p>
                                    <p className="text-2xl font-bold">{Math.round((stats.completedLessons / (stats.totalLessons || 1)) * 100)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                        <p className="text-yellow-800">You are not enrolled in any course yet. Please contact admin for enrollment.</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Lessons</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalLessons}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Video className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completedLessons}</p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Quizzes</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <HelpCircle className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Assignments</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
                            </div>
                            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {materials.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lessons List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b">
                                    <h3 className="font-semibold text-gray-800">Course Content</h3>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                    {materials.map((material, index) => (
                                        <div
                                            key={material.material_id}
                                            onClick={() => loadMaterialDetail(material.material_id)}
                                            className={`p-4 cursor-pointer hover:bg-indigo-50 transition-colors ${selectedMaterial?.material_id === material.material_id
                                                    ? 'bg-indigo-50 border-l-4 border-indigo-600'
                                                    : ''
                                                }`}
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">{material.title}</h4>
                                                    <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                                                        {material.duration_minutes && (
                                                            <span className="flex items-center">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {material.duration_minutes} min
                                                            </span>
                                                        )}
                                                    </div>
                                                    {(material.mcq_count > 0 || material.assignment_count > 0) && (
                                                        <div className="flex items-center mt-2 space-x-2">
                                                            {material.mcq_count > 0 && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                                    {material.mcq_count} Quiz
                                                                </span>
                                                            )}
                                                            {material.assignment_count > 0 && (
                                                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                                                    {material.assignment_count} Assignment
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {selectedMaterial ? (
                                <div className="space-y-6">
                                    {/* Video Player */}
                                    {selectedMaterial.video_url && (
                                        <div className="bg-black rounded-xl overflow-hidden aspect-video shadow-lg">
                                            <iframe
                                                src={getYouTubeEmbedUrl(selectedMaterial.video_url)}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    )}

                                    {/* Lesson Info */}
                                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                        <h2 className="text-xl font-bold text-gray-900">{selectedMaterial.title}</h2>
                                        {selectedMaterial.description && (
                                            <p className="mt-2 text-gray-600">{selectedMaterial.description}</p>
                                        )}
                                    </div>

                                    {/* Quiz Section */}
                                    {selectedMaterial.mcqs && selectedMaterial.mcqs.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <HelpCircle className="h-5 w-5 mr-2 text-green-600" />
                                                Quiz Questions
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedMaterial.mcqs.map((mcq, idx) => (
                                                    <div key={mcq.mcq_id} className="border border-gray-200 rounded-lg p-4">
                                                        <p className="font-medium text-gray-800 mb-3">
                                                            <span className="text-indigo-600 mr-2">Q{idx + 1}.</span>
                                                            {mcq.question}
                                                        </p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {['A', 'B', 'C', 'D'].map((option) => {
                                                                const optionValue = mcq[`option_${option.toLowerCase()}`];
                                                                if (!optionValue) return null;
                                                                return (
                                                                    <button
                                                                        key={option}
                                                                        className="text-left p-3 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 border border-gray-200 rounded-lg transition-colors"
                                                                    >
                                                                        <span className="font-medium text-indigo-600 mr-2">{option}.</span>
                                                                        {optionValue}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Assignments Section */}
                                    {selectedMaterial.assignments && selectedMaterial.assignments.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <FileText className="h-5 w-5 mr-2 text-orange-600" />
                                                Assignments
                                            </h3>
                                            <div className="space-y-3">
                                                {selectedMaterial.assignments.map((assignment) => (
                                                    <div key={assignment.assignment_id} className="border border-gray-200 rounded-lg p-4">
                                                        <h4 className="font-medium text-gray-800">{assignment.title}</h4>
                                                        {assignment.instructions && (
                                                            <p className="text-sm text-gray-600 mt-1">{assignment.instructions}</p>
                                                        )}
                                                        {assignment.due_date && (
                                                            <p className="text-sm text-orange-600 mt-2">Due: {assignment.due_date}</p>
                                                        )}
                                                        <button className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                                            Submit Assignment
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                                    <BookOpen className="h-16 w-16 mx-auto text-gray-300" />
                                    <h3 className="mt-4 text-xl font-medium text-gray-900">Select a lesson</h3>
                                    <p className="mt-2 text-gray-500">Choose a lesson from the sidebar to start learning</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                        <BookOpen className="h-16 w-16 mx-auto text-gray-300" />
                        <h3 className="mt-4 text-xl font-medium text-gray-900">No lessons available yet</h3>
                        <p className="mt-2 text-gray-500">Your instructor will add course content soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
