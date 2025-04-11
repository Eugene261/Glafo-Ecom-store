import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers, addUser, updateUserRole, deleteUser } from '../../redux/slices/adminUserSlice';

const UserManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { users, loading, error } = useSelector((state) => state.adminUsers);

    // Fetch users when component mounts
    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Redirect if not superAdmin
    useEffect(() => {
        if (!user || user.role !== 'superAdmin') {
            navigate('/');
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(addUser(formData)).unwrap()
            .then(() => {
                // Reset form after successful submission
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: "user"
                });
                // Refresh the users list
                dispatch(fetchAllUsers());
            })
            .catch((error) => {
                console.error('Failed to add user:', error);
            });
    };

    const [roleUpdateError, setRoleUpdateError] = useState(null);

    const handleRoleChange = (userId, newRole) => {
        // Clear any previous errors
        setRoleUpdateError(null);
        
        console.log(`Attempting to update user ${userId} to role ${newRole}`);
        dispatch(updateUserRole({ userId, role: newRole })).unwrap()
            .then((response) => {
                console.log('Role update successful:', response);
                // Refresh the users list after role update
                dispatch(fetchAllUsers());
            })
            .catch((error) => {
                console.error('Failed to update user role:', error);
                setRoleUpdateError(`Failed to update role: ${error}`);
                // Refresh the users list to reset any UI changes
                dispatch(fetchAllUsers());
            });
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            dispatch(deleteUser(userId)).unwrap()
                .then(() => {
                    // Refresh the users list after deletion
                    dispatch(fetchAllUsers());
                })
                .catch((error) => {
                    console.error('Failed to delete user:', error);
                });
        }
    };

    if (loading) {
        return (
            <div className='max-w-7xl mx-auto p-6'>
                <div className='text-center text-2xl'>Loading...</div>
            </div>
        );
    }

    return (
        <div className='max-w-7xl mx-auto p-6'>
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            {error && <div className='text-center text-red-500 mb-4'>{error}</div>}
            {roleUpdateError && <div className='text-center text-red-500 mb-4'>{roleUpdateError}</div>}
            
            {/* Add New User Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-bold mb-4">Add New User</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superAdmin">Super Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                    >
                        Add User
                    </button>
                </form>
            </div>

            {/* Admin Users List */}
            <h3 className="text-xl font-bold mt-8 mb-4">Admin Users</h3>
            <div className="bg-white overflow-x-auto shadow-md rounded-lg mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(users) && users
                            .filter(userData => userData.role === 'admin' || userData.role === 'superAdmin')
                            .map((userData) => (
                                <tr key={userData._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{userData.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={userData.role}
                                            onChange={(e) => handleRoleChange(userData._id, e.target.value)}
                                            className="text-sm border rounded p-1 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="superAdmin">Super Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleDeleteUser(userData._id)}
                                            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Regular Users List */}
            <h3 className="text-xl font-bold mb-4">Regular Users</h3>
            <div className="bg-white overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(users) && users
                            .filter(userData => userData.role === 'user')
                            .map((userData) => (
                                <tr key={userData._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{userData.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={userData.role}
                                            onChange={(e) => handleRoleChange(userData._id, e.target.value)}
                                            className="text-sm border rounded p-1 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="superAdmin">Super Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleDeleteUser(userData._id)}
                                            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserManagement;