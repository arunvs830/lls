import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    FileText, CheckCircle, Clock, User, Search,
    Award, X, Send, AlertCircle, Filter
} from 'lucide-react';

const Assignments = () => {
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, evaluated

    // Evaluation modal state
    const [showEvalModal, setShowEvalModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [evalForm, setEvalForm] = useState({ marks: '', feedback: '' });
    const [submitting, setSubmitting] = useState(false);

    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const isStaff = user?.role === 'staff';
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        loadSubmissions();
    }, []);

    useEffect(() => {
        filterSubmissions();
    }, [submissions, searchTerm, filterStatus]);

    const loadSubmissions = async () => {
        try {
            if (isStaff && user?.user_id) {
                const response = await api.get(`/submission/staff/${user.user_id}/submissions`);
                setSubmissions(response.data);
            } else if (isAdmin) {
                // Admin could see all submissions - for now just show message
                setSubmissions([]);
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterSubmissions = () => {
        let result = submissions;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.student_name?.toLowerCase().includes(term) ||
                s.assignment_title?.toLowerCase().includes(term) ||
                s.course_name?.toLowerCase().includes(term)
            );
        }

        // Filter by evaluation status
        if (filterStatus === 'pending') {
            result = result.filter(s => !s.is_evaluated);
        } else if (filterStatus === 'evaluated') {
            result = result.filter(s => s.is_evaluated);
        }

        setFilteredSubmissions(result);
    };

    const openEvalModal = (submission) => {
        setSelectedSubmission(submission);
        setEvalForm({
            marks: submission.marks?.toString() || '',
            feedback: submission.feedback || ''
        });
        setShowEvalModal(true);
    };

    const handleEvaluate = async () => {
        if (!evalForm.marks) {
            alert('Please enter marks');
            return;
        }

        const marks = parseFloat(evalForm.marks);
        if (isNaN(marks) || marks < 0 || marks > 100) {
            alert('Please enter valid marks between 0 and 100');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/submission/evaluations', {
                submission_id: selectedSubmission.submission_id,
                marks: marks,
                feedback: evalForm.feedback,
                evaluated_by: user?.user_id
            });

            // Refresh submissions
            await loadSubmissions();
            setShowEvalModal(false);
            setSelectedSubmission(null);
            setEvalForm({ marks: '', feedback: '' });
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            alert('Failed to submit evaluation. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getGradeColor = (marks) => {
        if (marks >= 90) return 'bg-green-100 text-green-800';
        if (marks >= 80) return 'bg-blue-100 text-blue-800';
        if (marks >= 70) return 'bg-indigo-100 text-indigo-800';
        if (marks >= 60) return 'bg-yellow-100 text-yellow-800';
        if (marks >= 50) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    const getGrade = (marks) => {
        if (marks >= 90) return 'A+';
        if (marks >= 80) return 'A';
        if (marks >= 70) return 'B';
        if (marks >= 60) return 'C';
        if (marks >= 50) return 'D';
        return 'F';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const pendingCount = submissions.filter(s => !s.is_evaluated).length;
    const evaluatedCount = submissions.filter(s => s.is_evaluated).length;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <FileText className="h-8 w-8 text-indigo-600 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Assignment Submissions</h1>
                        <p className="text-sm text-gray-500">Review and evaluate student submissions</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Submissions</p>
                            <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                        </div>
                        <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Pending Review</p>
                            <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
                        </div>
                        <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Evaluated</p>
                            <p className="text-2xl font-bold text-green-600">{evaluatedCount}</p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="flex items-center mb-4">
                    <Filter className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Search & Filter</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student, assignment..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Submissions</option>
                            <option value="pending">Pending Review</option>
                            <option value="evaluated">Evaluated</option>
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                            className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Submissions List */}
            {filteredSubmissions.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="divide-y divide-gray-200">
                        {filteredSubmissions.map((submission) => (
                            <div key={submission.submission_id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {submission.student_name}
                                                </h3>
                                                <p className="text-sm text-gray-500">{submission.student_email}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Assignment</p>
                                                <p className="text-sm font-medium text-gray-900">{submission.assignment_title}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Course / Lesson</p>
                                                <p className="text-sm text-gray-900">
                                                    {submission.course_name} - {submission.material_title}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-xs text-gray-500 uppercase mb-1">Submission</p>
                                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                                                {submission.assignment_text || 'No text submission'}
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center text-sm text-gray-500">
                                            <Clock className="h-4 w-4 mr-1" />
                                            Submitted: {submission.submitted_date ? new Date(submission.submitted_date).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>

                                    <div className="ml-6 flex flex-col items-end space-y-3">
                                        {submission.is_evaluated ? (
                                            <>
                                                <div className={`px-4 py-2 rounded-lg text-center ${getGradeColor(submission.marks)}`}>
                                                    <p className="text-2xl font-bold">{submission.marks}</p>
                                                    <p className="text-xs">Grade: {getGrade(submission.marks)}</p>
                                                </div>
                                                <button
                                                    onClick={() => openEvalModal(submission)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Edit Evaluation
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => openEvalModal(submission)}
                                                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            >
                                                <Award className="h-4 w-4 mr-2" />
                                                Evaluate
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {submission.feedback && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-blue-600 uppercase mb-1">Feedback</p>
                                        <p className="text-sm text-blue-800">{submission.feedback}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg p-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {submissions.length === 0
                            ? 'No students have submitted assignments yet.'
                            : 'Try adjusting your search or filter criteria.'}
                    </p>
                </div>
            )}

            {/* Evaluation Modal */}
            {showEvalModal && selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Evaluate Submission</h2>
                            <button
                                onClick={() => setShowEvalModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Submission Details */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500">Student</p>
                                    <p className="font-medium">{selectedSubmission.student_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Assignment</p>
                                    <p className="font-medium">{selectedSubmission.assignment_title}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Submission</p>
                                <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                                    {selectedSubmission.assignment_text || 'No text submission'}
                                </p>
                            </div>
                        </div>

                        {/* Evaluation Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Marks (0-100) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={evalForm.marks}
                                    onChange={(e) => setEvalForm({ ...evalForm, marks: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter marks out of 100"
                                />
                                {evalForm.marks && !isNaN(parseFloat(evalForm.marks)) && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        Grade: <span className="font-medium">{getGrade(parseFloat(evalForm.marks))}</span>
                                        {parseFloat(evalForm.marks) >= 40 ? (
                                            <span className="ml-2 text-green-600">• Pass</span>
                                        ) : (
                                            <span className="ml-2 text-red-600">• Fail</span>
                                        )}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Feedback (Optional)
                                </label>
                                <textarea
                                    value={evalForm.feedback}
                                    onChange={(e) => setEvalForm({ ...evalForm, feedback: e.target.value })}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Provide feedback for the student..."
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowEvalModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEvaluate}
                                disabled={submitting || !evalForm.marks}
                                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        {selectedSubmission.is_evaluated ? 'Update Evaluation' : 'Submit Evaluation'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
