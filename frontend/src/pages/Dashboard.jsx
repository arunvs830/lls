import React from 'react';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-700">Welcome back, {user?.name}!</h2>
                    <p className="text-gray-500 mt-2">Role: {user?.role}</p>
                </div>
                {/* Add more dashboard widgets based on role */}
            </div>
        </div>
    );
};

export default Dashboard;
