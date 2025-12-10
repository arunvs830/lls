import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Play, Plus, FileText, HelpCircle, ArrowLeft, Clock,
    Video, BookOpen, CheckCircle, Trash2, Edit, ShieldAlert
} from 'lucide-react';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const [materialForm, setMaterialForm] = useState({
        title: '',
        description: '',
        material_type: 'video',
        video_url: '',
        file_path: '',
        duration_minutes: ''
    });
    const [quizForm, setQuizForm] = useState({
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A'
    });
    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        instructions: '',
        due_date: ''
    });

    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';
    const isStaff = user?.role === 'staff';

    useEffect(() => {
        loadCourse();
        loadMaterials();
    }, [courseId]);

    const loadCourse = async () => {
        try {
            const response = await api.get('/academic/courses');
            const courseData = response.data.find(c => c.course_id === parseInt(courseId));

            // Check if staff user has access to this course
            if (isStaff && courseData && courseData.staff_id !== user?.user_id) {
                setAccessDenied(true);
                return;
            }

            setCourse(courseData);
        } catch (error) {
            console.error('Error loading course:', error);
        }
    };

    const loadMaterials = async () => {
        try {
            const response = await api.get(`/learning/courses/${courseId}/materials`);
            setMaterials(response.data);
            if (response.data.length > 0 && !selectedMaterial) {
                loadMaterialDetail(response.data[0].material_id);
            }
        } catch (error) {
            console.error('Error loading materials:', error);
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

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        await api.post('/learning/materials', {
            ...materialForm,
            course_id: parseInt(courseId),
            duration_minutes: materialForm.duration_minutes ? parseInt(materialForm.duration_minutes) : null,
            uploaded_by: user?.user_id
        });
        setShowAddModal(false);
        setMaterialForm({
            title: '',
            description: '',
            material_type: 'video',
            video_url: '',
            file_path: '',
            duration_minutes: ''
        });
        loadMaterials();
    };

    const handleAddQuiz = async (e) => {
        e.preventDefault();
        await api.post('/learning/mcqs', {
            ...quizForm,
            material_id: selectedMaterial.material_id
        });
        setShowQuizModal(false);
        setQuizForm({
            question: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: 'A'
        });
        loadMaterialDetail(selectedMaterial.material_id);
        loadMaterials();
    };

    const handleAddAssignment = async (e) => {
        e.preventDefault();
        await api.post('/learning/assignments', {
            ...assignmentForm,
            material_id: selectedMaterial.material_id
        });
        setShowAssignmentModal(false);
        setAssignmentForm({ title: '', instructions: '', due_date: '' });
        loadMaterialDetail(selectedMaterial.material_id);
        loadMaterials();
    };

    const deleteQuiz = async (mcqId) => {
        if (confirm('Are you sure you want to delete this quiz question?')) {
            await api.delete(`/learning/mcqs/${mcqId}`);
            loadMaterialDetail(selectedMaterial.material_id);
            loadMaterials();
        }
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
    };

    // Access Denied Screen for unauthorized staff
    if (accessDenied) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ShieldAlert className="h-16 w-16 mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">You don't have permission to access this course.</p>
                    <p className="text-sm text-gray-500 mb-6">You can only manage courses assigned to you.</p>
                    <button
                        onClick={() => navigate('/courses')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Back to My Courses
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <button
                        onClick={() => navigate('/courses')}
                        className="flex items-center text-white/80 hover:text-white mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Courses
                    </button>
                    <h1 className="text-3xl font-bold">{course.course_name}</h1>
                    <p className="text-white/80 mt-1">{course.description}</p>
                    <div className="flex items-center mt-4 space-x-4">
                        <span className="flex items-center text-sm">
                            <Video className="h-4 w-4 mr-1" />
                            {materials.length} Lessons
                        </span>
                        {course.teacher_name && (
                            <span className="text-sm">
                                Instructor: {course.teacher_name}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Sidebar - Lesson List */}
                    <div className="w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                <h2 className="font-semibold text-gray-800">Course Content</h2>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    title="Add Material"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                {materials.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        <Video className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                        <p>No lessons yet</p>
                                        <button
                                            onClick={() => setShowAddModal(true)}
                                            className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm"
                                        >
                                            Add your first lesson
                                        </button>
                                    </div>
                                ) : (
                                    materials.map((material, index) => (
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
                                                    <h3 className="text-sm font-medium text-gray-900">{material.title}</h3>
                                                    <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                                                        {material.material_type === 'video' && (
                                                            <span className="flex items-center">
                                                                <Play className="h-3 w-3 mr-1" />
                                                                Video
                                                            </span>
                                                        )}
                                                        {material.duration_minutes && (
                                                            <span className="flex items-center">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {material.duration_minutes} min
                                                            </span>
                                                        )}
                                                    </div>
                                                    {(material.mcq_count > 0 || material.assignment_count > 0) && (
                                                        <div className="flex items-center mt-1 space-x-2">
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
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {selectedMaterial ? (
                            <div className="space-y-6">
                                {/* Video Player */}
                                {selectedMaterial.video_url && (
                                    <div className="bg-black rounded-xl overflow-hidden aspect-video">
                                        <iframe
                                            src={getYouTubeEmbedUrl(selectedMaterial.video_url)}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                )}

                                {/* Lesson Info */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedMaterial.title}</h2>
                                    {selectedMaterial.description && (
                                        <p className="mt-2 text-gray-600">{selectedMaterial.description}</p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => {
                                                console.log('Add Quiz Question clicked');
                                                setShowQuizModal(true);
                                            }}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            <HelpCircle className="h-4 w-4 mr-2" />
                                            Add Quiz Question
                                        </button>
                                        <button
                                            onClick={() => setShowAssignmentModal(true)}
                                            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Add Assignment
                                        </button>
                                    </div>
                                </div>

                                {/* Quiz Questions */}
                                {selectedMaterial.mcqs && selectedMaterial.mcqs.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <HelpCircle className="h-5 w-5 mr-2 text-green-600" />
                                            Quiz Questions ({selectedMaterial.mcqs.length})
                                        </h3>
                                        <div className="space-y-4">
                                            {selectedMaterial.mcqs.map((mcq, idx) => (
                                                <div key={mcq.mcq_id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-medium text-gray-800">
                                                            <span className="text-indigo-600 mr-2">Q{idx + 1}.</span>
                                                            {mcq.question}
                                                        </p>
                                                        <button
                                                            onClick={() => deleteQuiz(mcq.mcq_id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                                        <div className="text-sm bg-gray-50 p-2 rounded">A. {mcq.option_a}</div>
                                                        <div className="text-sm bg-gray-50 p-2 rounded">B. {mcq.option_b}</div>
                                                        {mcq.option_c && <div className="text-sm bg-gray-50 p-2 rounded">C. {mcq.option_c}</div>}
                                                        {mcq.option_d && <div className="text-sm bg-gray-50 p-2 rounded">D. {mcq.option_d}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Assignments */}
                                {selectedMaterial.assignments && selectedMaterial.assignments.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <FileText className="h-5 w-5 mr-2 text-orange-600" />
                                            Assignments ({selectedMaterial.assignments.length})
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
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <BookOpen className="h-16 w-16 mx-auto text-gray-300" />
                                <h3 className="mt-4 text-xl font-medium text-gray-900">No lesson selected</h3>
                                <p className="mt-2 text-gray-500">Select a lesson from the sidebar or add your first lesson</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Material Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Add New Lesson</h2>
                        <form onSubmit={handleAddMaterial}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Lesson title"
                                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                        value={materialForm.title}
                                        onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        placeholder="Brief description of the lesson"
                                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                        value={materialForm.description}
                                        onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Video URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                        value={materialForm.video_url}
                                        onChange={(e) => setMaterialForm({ ...materialForm, video_url: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">YouTube or other video platform links</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Or File Path</label>
                                    <input
                                        type="text"
                                        placeholder="/path/to/video.mp4"
                                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                        value={materialForm.file_path}
                                        onChange={(e) => setMaterialForm({ ...materialForm, file_path: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 15"
                                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                        value={materialForm.duration_minutes}
                                        onChange={(e) => setMaterialForm({ ...materialForm, duration_minutes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Add Lesson
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Quiz Modal */}
            {showQuizModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 9999 }}>
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Add Quiz Question</h2>
                        <form onSubmit={handleAddQuiz}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Question *</label>
                                    <textarea
                                        required
                                        placeholder="Enter your question"
                                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                        value={quizForm.question}
                                        onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Option A *</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                            value={quizForm.option_a}
                                            onChange={(e) => setQuizForm({ ...quizForm, option_a: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Option B *</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                            value={quizForm.option_b}
                                            onChange={(e) => setQuizForm({ ...quizForm, option_b: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Option C</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                            value={quizForm.option_c}
                                            onChange={(e) => setQuizForm({ ...quizForm, option_c: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Option D</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                            value={quizForm.option_d}
                                            onChange={(e) => setQuizForm({ ...quizForm, option_d: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Correct Answer *</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                        value={quizForm.correct_option}
                                        onChange={(e) => setQuizForm({ ...quizForm, correct_option: e.target.value })}
                                    >
                                        <option value="A">Option A</option>
                                        <option value="B">Option B</option>
                                        <option value="C">Option C</option>
                                        <option value="D">Option D</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowQuizModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Add Question
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Assignment Modal */}
            {showAssignmentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Add Assignment</h2>
                        <form onSubmit={handleAddAssignment}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Assignment title"
                                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                        value={assignmentForm.title}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Instructions</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe the assignment requirements..."
                                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                        value={assignmentForm.instructions}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                        value={assignmentForm.due_date}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignmentModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                >
                                    Add Assignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;
