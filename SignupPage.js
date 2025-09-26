import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaHubspot } from 'react-icons/fa'; // Importing an icon for branding

function SignupPage({ onSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/signup', { email, password });
            setMessage(response.data.message);
            onSignup();
        } catch (error) {
             if (error.response && error.response.data && error.response.data.error) {
                setMessage(error.response.data.error);
            } else {
                setMessage('An unexpected error occurred during signup.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
                {/* Left Side */}
                <div className="relative flex flex-col justify-center p-8 text-center text-white bg-blue-600 rounded-2xl md:rounded-l-2xl md:rounded-r-none md:w-80">
                    <div className="absolute top-4 left-4">
                        <FaHubspot size="28" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Get Started</h1>
                    <p className="mt-4 text-sm font-medium">
                        Create your account to unlock powerful productivity tools and integrations.
                    </p>
                </div>

                {/* Right Side */}
                <div className="flex flex-col justify-center p-8 md:p-14">
                    <span className="mb-3 text-4xl font-bold">Create Account</span>
                    <span className="font-light text-gray-500 mb-8">
                        Join us to streamline your workflow
                    </span>
                    <form onSubmit={handleSubmit}>
                        <div className="py-4">
                            <span className="mb-2 text-md">Email</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                                required
                            />
                        </div>
                        <div className="py-4">
                            <span className="mb-2 text-md">Password</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white p-2 mt-4 rounded-lg mb-6 hover:bg-blue-700 hover:shadow-lg transition-all"
                        >
                            Sign Up
                        </button>
                    </form>
                    {message && <p className="mt-4 text-center text-red-500">{message}</p>}
                    <div className="text-center text-gray-500">
                        Already have an account?{' '}
                        <button 
                            onClick={() => navigate('/login')} 
                            className="font-bold text-blue-600 hover:underline"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
