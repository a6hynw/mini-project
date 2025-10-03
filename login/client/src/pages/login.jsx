import React, { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('faculty');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerCollegeId, setRegisterCollegeId] = useState('');


  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerDepartment, setRegisterDepartment] = useState('cse');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Backend base URL
  const BASE_URL = 'http://localhost:5000/api';

  // Login handler
  const login = async () => {
    setLoginError('');
    setLoginLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        email: loginEmail,
        password: loginPassword,
        role: loginRole, // if your backend expects role, else remove
      });

      // Save token and user data to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));

      // Redirect or update UI as needed
      alert('Login successful!');
      // For example, redirect to dashboard:
      window.location.href = '/dashboard';
    } catch (error) {
      setLoginError(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // Register handler
  const register = async () => {
  setRegisterError('');

  if (registerPassword !== registerConfirm) {
    setRegisterError("Passwords don't match");
    return;
  }

  if (!registerName || !registerEmail || !registerCollegeId || !registerDepartment) {
    setRegisterError('Please fill in all required fields');
    return;
  }

  setRegisterLoading(true);
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      name: registerName,
      email: registerEmail,
      password: registerPassword,
      department: registerDepartment,
      collegeId: registerCollegeId,
      role: 'faculty', // if your backend expects role
    });

    alert('Registration successful! Please login.');
    setIsLogin(true);
    // Clear form fields
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirm('');
    setRegisterDepartment('cse');
    setRegisterCollegeId('');
  } catch (error) {
    setRegisterError(
      error.response?.data?.message || 'Registration failed. Please try again.'
    );
  } finally {
    setRegisterLoading(false);
  }
};


  return (
    <div
      id="auth-section"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            {/* Replace with your icon or SVG */}
            <i className="fas fa-building text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Reserva</h1>
          <p className="text-gray-600 mt-2">Smart Hall Booking System</p>
          <p className="text-sm text-gray-500 mt-1">
            Adi Shankara Institute of Engineering and Technology
          </p>
        </div>

        {isLogin ? (
          <div id="login-form" className="space-y-6">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="login-email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="faculty@adishankara.ac.in"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="login-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="login-role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Role
              </label>
              <select
                id="login-role"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
              >
                <option value="faculty">Faculty Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {loginError && (
              <p className="text-red-600 text-sm font-medium">{loginError}</p>
            )}

            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-md"
              type="button"
              disabled={loginLoading}
            >
              {loginLoading ? 'Signing In...' : 'Sign In to Reserva'}
            </button>

            <div className="text-center">
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200"
                type="button"
              >
                Don't have an account? Register here
              </button>
            </div>
          </div>
        ) : (
          <div id="register-form" className="space-y-6">
            <div>
              <label
                htmlFor="register-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="register-name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dr. Rajesh Kumar"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="register-email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="faculty@adishankara.ac.in"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="register-collegeId" className="block text-sm font-medium text-gray-700 mb-2">College ID</label>
              <input
                type="text"
                id="register-collegeId"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your College ID"
                value={registerCollegeId}
                onChange={e => setRegisterCollegeId(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="register-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Minimum 8 characters"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="register-confirm"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="register-confirm"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                value={registerConfirm}
                onChange={(e) => setRegisterConfirm(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="register-department"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Department
              </label>
              <select
                id="register-department"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={registerDepartment}
                onChange={(e) => setRegisterDepartment(e.target.value)}
              >
                <option value="cse">Computer Science & Engineering</option>
                <option value="ece">Electronics & Communication</option>
                <option value="mech">Mechanical Engineering</option>
                <option value="civil">Civil Engineering</option>
                <option value="admin">Administration</option>
              </select>
            </div>

            {registerError && (
              <p className="text-red-600 text-sm font-medium">{registerError}</p>
            )}

            <button
              onClick={register}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition duration-200 shadow-md"
              type="button"
              disabled={registerLoading}
            >
              {registerLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center">
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200"
                type="button"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
