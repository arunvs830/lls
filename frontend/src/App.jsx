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
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const PrivateRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? children : <Navigate to="/login" />;
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

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/courses/:courseId"
                    element={
                        <PrivateRoute>
                            <CourseDetail />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/*"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/academic-years" element={<AcademicYears />} />
                                    <Route path="/programs" element={<Programs />} />
                                    <Route path="/courses" element={<Courses />} />
                                    <Route path="/staff" element={<Staff />} />
                                    <Route path="/students" element={<Students />} />
                                    <Route path="/assignments" element={<Assignments />} />
                                    <Route path="/results" element={<Results />} />
                                </Routes>
                            </Layout>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

