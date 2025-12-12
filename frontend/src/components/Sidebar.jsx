import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Users, FileText, CheckSquare, Award } from 'lucide-react';

const Sidebar = ({ role }) => {
    const location = useLocation();

    const links = [
        { name: 'Dashboard', path: '/', icon: <BookOpen size={20} />, roles: ['admin', 'staff', 'student'] },
        { name: 'Academic Years', path: '/academic-years', icon: <Calendar size={20} />, roles: ['admin'] },
        { name: 'Programs', path: '/programs', icon: <BookOpen size={20} />, roles: ['admin'] },
        { name: 'Staff', path: '/staff', icon: <Users size={20} />, roles: ['admin'] },
        { name: 'Courses', path: '/courses', icon: <BookOpen size={20} />, roles: ['admin', 'staff', 'student'] },
        { name: 'Students', path: '/students', icon: <Users size={20} />, roles: ['admin', 'staff'] },
        { name: 'Assignments', path: '/assignments', icon: <FileText size={20} />, roles: ['staff', 'student'] },
        { name: 'Results', path: '/results', icon: <CheckSquare size={20} />, roles: ['student', 'staff'] },
    ];

    const filteredLinks = links.filter(link => link.roles.includes(role));

    return (
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-16 overflow-y-auto">
            <div className="py-4">
                <ul className="space-y-2">
                    {filteredLinks.map((link) => (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors ${location.pathname === link.path ? 'bg-indigo-50 text-primary border-r-4 border-primary' : ''
                                    }`}
                            >
                                <span className="mr-3">{link.icon}</span>
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
