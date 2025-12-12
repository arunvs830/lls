import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    BookOpen, Play, FileText, Award, Clock, CheckCircle, XCircle,
    User, LogOut, ChevronRight, Video, HelpCircle, GraduationCap,
    Send, Upload, X, AlertCircle
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

    // Quiz state
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizResults, setQuizResults] = useState(null);
    const [submittingQuiz, setSubmittingQuiz] = useState(false);

    // Assignment state
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [assignmentText, setAssignmentText] = useState('');
    const [submittingAssignment, setSubmittingAssignment] = useState(false);
    const [assignmentSubmissions, setAssignmentSubmissions] = useState({});

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

                // Calculate basic stats
                const totalLessons = materialsResponse.data.length;
                const totalQuizzes = materialsResponse.data.reduce((sum, m) => sum + (m.mcq_count || 0), 0);
                const totalAssignments = materialsResponse.data.reduce((sum, m) => sum + (m.assignment_count || 0), 0);

                // Fetch student progress
                let progressData = { completed_quizzes: 0, submitted_assignments: 0, progress_percentage: 0 };
                try {
                    const progressResponse = await api.get(`/learning/student/${user.student_id}/course/${user.course_id}/progress`);
                    progressData = progressResponse.data;
                } catch (e) {
                    console.error('Error loading progress:', e);
                }

                setStats({
                    totalLessons,
                    completedQuizzes: progressData.completed_quizzes,
                    totalQuizzes,
                    submittedAssignments: progressData.submitted_assignments,
                    totalAssignments,
                    progressPercentage: progressData.progress_percentage
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

            // Reset quiz state when loading new material
            setQuizAnswers({});
            setQuizSubmitted(false);
            setQuizResults(null);

            // Load existing quiz results for this material
            try {
                const quizResultsResponse = await api.get(`/learning/quiz/results/${user.student_id}/${materialId}`);
                if (quizResultsResponse.data.length > 0) {
                    setQuizSubmitted(true);
                    // Convert to results format
                    const resultsMap = {};
                    let correctCount = 0;
                    quizResultsResponse.data.forEach(r => {
                        const isCorrect = r.status === 'Pass';
                        resultsMap[r.mcq_id] = isCorrect;
                        if (isCorrect) correctCount++;
                    });
                    const totalCount = quizResultsResponse.data.length;
                    const scorePercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

                    setQuizResults({
                        resultsMap,
                        correct_count: correctCount,
                        total_count: totalCount,
                        score_percentage: scorePercentage
                    });
                }
            } catch (e) {
                // No existing results
            }

            // Load existing assignment submissions
            try {
                const submissionsResponse = await api.get(`/learning/assignments/submissions/${user.student_id}/${materialId}`);
                const submissionsMap = {};
                submissionsResponse.data.forEach(s => {
                    submissionsMap[s.assignment_id] = s;
                });
                setAssignmentSubmissions(submissionsMap);
            } catch (e) {
                // No existing submissions
            }
        } catch (error) {
            console.error('Error loading material:', error);
        }
    };

    const handleQuizAnswer = (mcqId, option) => {
        if (quizSubmitted) return; // Don't allow changes after submission
        setQuizAnswers(prev => ({
            ...prev,
            [mcqId]: option
        }));
    };

    const handleSubmitQuiz = async () => {
        if (!selectedMaterial?.mcqs) return;

        // Check if all questions are answered
        const unanswered = selectedMaterial.mcqs.filter(mcq => !quizAnswers[mcq.mcq_id]);
        if (unanswered.length > 0) {
            alert(`Please answer all questions before submitting. ${unanswered.length} question(s) remaining.`);
            return;
        }

        setSubmittingQuiz(true);
        try {
            const answers = Object.entries(quizAnswers).map(([mcq_id, selected_option]) => ({
                mcq_id: parseInt(mcq_id),
                selected_option
            }));

            const response = await api.post('/learning/quiz/submit', {
                student_id: user.student_id,
                answers
            });

            // Build results map
            const resultsMap = {};
            response.data.results.forEach(r => {
                resultsMap[r.mcq_id] = r.is_correct;
            });

            setQuizResults({
                ...response.data,
                resultsMap
            });
            setQuizSubmitted(true);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz. Please try again.');
        } finally {
            setSubmittingQuiz(false);
        }
    };

    const handleOpenAssignmentModal = (assignment) => {
        setSelectedAssignment(assignment);
        // Pre-fill with existing submission if any
        const existingSubmission = assignmentSubmissions[assignment.assignment_id];
        setAssignmentText(existingSubmission?.assignment_text || '');
        setShowAssignmentModal(true);
    };

    const handleSubmitAssignment = async () => {
        if (!selectedAssignment || !assignmentText.trim()) {
            alert('Please enter your assignment response.');
            return;
        }

        setSubmittingAssignment(true);
        try {
            const response = await api.post('/learning/assignments/submit', {
                assignment_id: selectedAssignment.assignment_id,
                student_id: user.student_id,
                assignment_text: assignmentText
            });

            // Update local state
            setAssignmentSubmissions(prev => ({
                ...prev,
                [selectedAssignment.assignment_id]: {
                    assignment_id: selectedAssignment.assignment_id,
                    assignment_text: assignmentText,
                    submitted_date: new Date().toISOString()
                }
            }));

            setShowAssignmentModal(false);
            setAssignmentText('');
            setSelectedAssignment(null);
            alert('Assignment submitted successfully!');
        } catch (error) {
            console.error('Error submitting assignment:', error);
            alert('Failed to submit assignment. Please try again.');
        } finally {
            setSubmittingAssignment(false);
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
                                <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[120px]">
                                    <p className="text-sm">Progress</p>
                                    <p className="text-2xl font-bold">{stats.progressPercentage || 0}%</p>
                                    <div className="mt-2 h-2 bg-white/30 rounded-full">
                                        <div
                                            className="h-2 bg-white rounded-full transition-all duration-500"
                                            style={{ width: `${stats.progressPercentage || 0}%` }}
                                        />
                                    </div>
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
                                <p className="text-gray-500 text-sm">Overall Progress</p>
                                <p className="text-2xl font-bold text-green-600">{stats.progressPercentage || 0}%</p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Quizzes Completed</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {stats.completedQuizzes || 0}<span className="text-sm text-gray-400">/{stats.totalQuizzes}</span>
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <HelpCircle className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Assignments Submitted</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {stats.submittedAssignments || 0}<span className="text-sm text-gray-400">/{stats.totalAssignments}</span>
                                </p>
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
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                                    <HelpCircle className="h-5 w-5 mr-2 text-green-600" />
                                                    Quiz ({selectedMaterial.mcqs.length} Questions)
                                                </h3>
                                                {quizSubmitted && quizResults && (
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${quizResults.score_percentage >= 70
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            Score: {quizResults.score_percentage}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6">
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

                                                                const isSelected = quizAnswers[mcq.mcq_id] === option;
                                                                const isCorrect = quizResults?.resultsMap?.[mcq.mcq_id] !== undefined
                                                                    ? (quizResults.results?.find(r => r.mcq_id === mcq.mcq_id)?.correct_option === option)
                                                                    : false;
                                                                const showResult = quizSubmitted && quizResults;

                                                                let buttonClass = 'text-left p-3 border rounded-lg transition-all ';

                                                                if (showResult) {
                                                                    if (isCorrect) {
                                                                        buttonClass += 'bg-green-100 border-green-400 text-green-800';
                                                                    } else if (isSelected && !quizResults.resultsMap?.[mcq.mcq_id]) {
                                                                        buttonClass += 'bg-red-100 border-red-400 text-red-800';
                                                                    } else {
                                                                        buttonClass += 'bg-gray-50 border-gray-200 text-gray-600';
                                                                    }
                                                                } else {
                                                                    buttonClass += isSelected
                                                                        ? 'bg-indigo-100 border-indigo-400 text-indigo-800'
                                                                        : 'bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 border-gray-200';
                                                                }

                                                                return (
                                                                    <button
                                                                        key={option}
                                                                        onClick={() => handleQuizAnswer(mcq.mcq_id, option)}
                                                                        disabled={quizSubmitted}
                                                                        className={buttonClass}
                                                                    >
                                                                        <div className="flex items-center">
                                                                            <span className="font-medium text-indigo-600 mr-2">{option}.</span>
                                                                            <span className="flex-1">{optionValue}</span>
                                                                            {showResult && isCorrect && (
                                                                                <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                                                                            )}
                                                                            {showResult && isSelected && !quizResults.resultsMap?.[mcq.mcq_id] && (
                                                                                <XCircle className="h-4 w-4 text-red-600 ml-2" />
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {!quizSubmitted && (
                                                <div className="mt-6 flex justify-between items-center">
                                                    <p className="text-sm text-gray-500">
                                                        {Object.keys(quizAnswers).length} of {selectedMaterial.mcqs.length} questions answered
                                                    </p>
                                                    {Object.keys(quizAnswers).length > 0 ? (
                                                        <button
                                                            onClick={handleSubmitQuiz}
                                                            disabled={submittingQuiz}
                                                            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                                        >
                                                            {submittingQuiz ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                    Submitting...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Send className="h-4 w-4 mr-2" />
                                                                    Submit Quiz
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <div className="px-6 py-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                                                            <span className="flex items-center">
                                                                <Send className="h-4 w-4 mr-2" />
                                                                Select answers to submit
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {quizSubmitted && (
                                                <div className="mt-4 flex items-center justify-center p-3 bg-gray-100 rounded-lg text-gray-600">
                                                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                                    <span className="font-medium">Quiz submitted - Your answers are locked</span>
                                                </div>
                                            )}

                                            {quizSubmitted && quizResults && (
                                                <div className={`mt-6 p-4 rounded-lg ${quizResults.score_percentage >= 70
                                                    ? 'bg-green-50 border border-green-200'
                                                    : 'bg-red-50 border border-red-200'
                                                    }`}>
                                                    <div className="flex items-center">
                                                        {quizResults.score_percentage >= 70 ? (
                                                            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                                                        ) : (
                                                            <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                                                        )}
                                                        <div>
                                                            <p className={`font-medium ${quizResults.score_percentage >= 70 ? 'text-green-800' : 'text-red-800'
                                                                }`}>
                                                                {quizResults.score_percentage >= 70 ? 'Great job!' : 'Keep practicing!'}
                                                            </p>
                                                            <p className={`text-sm ${quizResults.score_percentage >= 70 ? 'text-green-700' : 'text-red-700'
                                                                }`}>
                                                                You got {quizResults.correct_count} out of {quizResults.total_count} questions correct ({quizResults.score_percentage}%)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Assignments Section */}
                                    {selectedMaterial.assignments && selectedMaterial.assignments.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <FileText className="h-5 w-5 mr-2 text-orange-600" />
                                                Assignments
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedMaterial.assignments.map((assignment) => {
                                                    const submission = assignmentSubmissions[assignment.assignment_id];
                                                    const isSubmitted = !!submission;

                                                    return (
                                                        <div key={assignment.assignment_id} className="border border-gray-200 rounded-lg p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium text-gray-800">{assignment.title}</h4>
                                                                    {assignment.instructions && (
                                                                        <p className="text-sm text-gray-600 mt-1">{assignment.instructions}</p>
                                                                    )}
                                                                    {assignment.due_date && (
                                                                        <p className="text-sm text-orange-600 mt-2 flex items-center">
                                                                            <Clock className="h-4 w-4 mr-1" />
                                                                            Due: {assignment.due_date}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col items-end space-y-1">
                                                                    {isSubmitted && (
                                                                        <span className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                                            Submitted
                                                                        </span>
                                                                    )}
                                                                    {submission?.is_evaluated && (
                                                                        <span className={`text-sm font-bold px-3 py-1 rounded ${submission.marks >= 40
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                            }`}>
                                                                            {submission.marks}/100
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {isSubmitted && (
                                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                                    <p className="text-xs text-gray-500 mb-1">Your submission:</p>
                                                                    <p className="text-sm text-gray-700">{submission.assignment_text}</p>
                                                                    <p className="text-xs text-gray-400 mt-2">
                                                                        Submitted on: {new Date(submission.submitted_date).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Show evaluation results */}
                                                            {submission?.is_evaluated && (
                                                                <div className={`mt-3 p-4 rounded-lg border ${submission.marks >= 40
                                                                    ? 'bg-green-50 border-green-200'
                                                                    : 'bg-red-50 border-red-200'
                                                                    }`}>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-sm font-medium text-gray-700">Evaluation Result</span>
                                                                        <span className={`text-lg font-bold ${submission.marks >= 40 ? 'text-green-700' : 'text-red-700'
                                                                            }`}>
                                                                            {submission.marks >= 40 ? '✓ Pass' : '✗ Fail'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-4">
                                                                        <div>
                                                                            <p className="text-xs text-gray-500">Marks</p>
                                                                            <p className="text-xl font-bold text-gray-900">{submission.marks}<span className="text-sm text-gray-500">/100</span></p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-gray-500">Grade</p>
                                                                            <p className="text-xl font-bold text-gray-900">
                                                                                {submission.marks >= 90 ? 'A+' :
                                                                                    submission.marks >= 80 ? 'A' :
                                                                                        submission.marks >= 70 ? 'B' :
                                                                                            submission.marks >= 60 ? 'C' :
                                                                                                submission.marks >= 50 ? 'D' : 'F'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {submission.feedback && (
                                                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                                            <p className="text-xs text-gray-500 mb-1">Instructor Feedback:</p>
                                                                            <p className="text-sm text-gray-700">{submission.feedback}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {!submission?.is_evaluated && (
                                                                <button
                                                                    onClick={() => handleOpenAssignmentModal(assignment)}
                                                                    className={`mt-3 flex items-center px-4 py-2 rounded-lg transition-colors ${isSubmitted
                                                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                        : 'bg-orange-600 text-white hover:bg-orange-700'
                                                                        }`}
                                                                >
                                                                    {isSubmitted ? (
                                                                        <>
                                                                            <FileText className="h-4 w-4 mr-2" />
                                                                            Edit Submission
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Upload className="h-4 w-4 mr-2" />
                                                                            Submit Assignment
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
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

            {/* Assignment Submission Modal */}
            {
                showAssignmentModal && selectedAssignment && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Submit Assignment</h2>
                                <button
                                    onClick={() => setShowAssignmentModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <h3 className="font-medium text-orange-800">{selectedAssignment.title}</h3>
                                {selectedAssignment.instructions && (
                                    <p className="text-sm text-orange-700 mt-1">{selectedAssignment.instructions}</p>
                                )}
                                {selectedAssignment.due_date && (
                                    <p className="text-sm text-orange-600 mt-2">Due: {selectedAssignment.due_date}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Response *
                                </label>
                                <textarea
                                    value={assignmentText}
                                    onChange={(e) => setAssignmentText(e.target.value)}
                                    placeholder="Type your assignment response here..."
                                    rows={8}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowAssignmentModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitAssignment}
                                    disabled={submittingAssignment || !assignmentText.trim()}
                                    className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                                >
                                    {submittingAssignment ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit Assignment
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default StudentDashboard;
