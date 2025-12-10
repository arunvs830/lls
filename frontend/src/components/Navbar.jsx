import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-primary">LLS</span>
                        </Link>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="text-primary hover:text-indigo-800 font-medium">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
