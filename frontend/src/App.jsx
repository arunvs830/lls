import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AcademicYears from './pages/AcademicYears';
import Programs from './pages/Programs';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Staff from './pages/Staff';
import Students from './pages/Students';
import Assignments from './pages/Assignments';
import Results from './pages/Results';
import StudentRegister from './pages/StudentRegister';
import StudentDashboard from './pages/StudentDashboard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const PrivateRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? children : <Navigate to="/login" />;
};

// Route guard for admin/staff only routes
const AdminStaffRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'student') return <Navigate to="/student-dashboard" />;
    return children;
};

const Layout = ({ children, fullWidth = false }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return (
        <div className="min-h-screen bg-gray-50">
            {!fullWidth && <Navbar />}
            <div className="flex">
                {user && !fullWidth && <Sidebar role={user.role} />}
                <main className={`flex-1 ${fullWidth ? '' : 'p-8'} ${user && !fullWidth ? 'ml-64' : ''}`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

// Smart home route - redirects based on role
const HomeRedirect = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'student') return <Navigate to="/student-dashboard" />;
    return <Dashboard />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<StudentRegister />} />

                {/* Student Dashboard - No sidebar */}
                <Route
                    path="/student-dashboard"
                    element={
                        <PrivateRoute>
                            <StudentDashboard />
                        </PrivateRoute>
                    }
                />

                {/* Course Detail - Fullscreen */}
                <Route
                    path="/courses/:courseId"
                    element={
                        <AdminStaffRoute>
                            <CourseDetail />
                        </AdminStaffRoute>
                    }
                />

                {/* Admin/Staff Routes with Layout */}
                <Route
                    path="/*"
                    element={
                        <AdminStaffRoute>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<HomeRedirect />} />
                                    <Route path="/academic-years" element={<AcademicYears />} />
                                    <Route path="/programs" element={<Programs />} />
                                    <Route path="/courses" element={<Courses />} />
                                    <Route path="/staff" element={<Staff />} />
                                    <Route path="/students" element={<Students />} />
                                    <Route path="/assignments" element={<Assignments />} />
                                    <Route path="/results" element={<Results />} />
                                </Routes>
                            </Layout>
                        </AdminStaffRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
