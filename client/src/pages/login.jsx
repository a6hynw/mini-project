import React, { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [toast, setToast] = useState('');
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

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

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Backend base URL
  const BASE_URL = 'http://localhost:5000/api';

  // Forgot password handler
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');

    try {
      const response = await axios.post(`${BASE_URL}/forgot-password`, {
        email: forgotEmail
      });

      if (response.data.success) {
        setForgotMessage('Password reset email sent! Check your inbox.');
        setForgotEmail('');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setForgotError(error.response?.data?.message || 'Error sending reset email. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Login handler
  const login = async () => {
    setLoginError('');
    setLoginLoading(true);
    try {
      let response;
      
      if (loginRole === 'admin') {
        // Handle admin login
        response = await axios.post(`${BASE_URL}/admin/login`, {
          email: loginEmail,
          password: loginPassword,
        });
      } else {
        // Handle faculty login
        response = await axios.post(`${BASE_URL}/login`, {
          email: loginEmail,
          password: loginPassword,
          role: loginRole,
        });
      }

      // Save token and user data to localStorage
      localStorage.setItem('token', response.data.token);
      
      if (loginRole === 'admin') {
        // For admin, save user data directly
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      } else {
        // For faculty, merge with any locally saved avatar
        const avatarKey = response?.data?.user?.email ? `userAvatar:${response.data.user.email}` : null;
        const localAvatar = avatarKey ? localStorage.getItem(avatarKey) : '';
        const mergedUser = localAvatar ? { ...response.data.user, avatar: localAvatar } : response.data.user;
        localStorage.setItem('userData', JSON.stringify(mergedUser));
      }

      // Toast + delayed redirect based on role
      const redirectPath = loginRole === 'admin' ? '/admin-dashboard' : '/dashboard';
      setToast(`Welcome back! Redirecting to ${loginRole} dashboard...`);
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 900);
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
      className="min-h-screen relative flex items-center justify-center bg-gray-50 dark:bg-[#0b0f17] p-4"
    >
      <div className="bg-gradient-animate" />
      <button
        onClick={toggleTheme}
        title="Toggle theme"
        className="absolute top-4 right-4 z-10 text-gray-700 dark:text-gray-200 hover:text-indigo-400 transition"
        type="button"
      >
        <i className="fas fa-moon dark:hidden"></i>
        <i className="fas fa-sun hidden dark:inline"></i>
      </button>
      <div className="glass-panel running-light reveal-hover rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition duration-300 ease-out hover:scale-105">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 shadow-lg">
            <img 
              src="/src/assets/reservaa-logo.svg" 
              alt="Reservaa Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center hidden">
              <i className="fas fa-building text-3xl text-white"></i>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reservaa</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Smart Hall Booking System</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Adi Shankara Institute of Engineering and Technology
          </p>
        </div>

        {isLogin ? (
          <div id="login-form" className="space-y-6 reveal-target">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="login-email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-transparent dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder={loginRole === 'admin' ? 'admin@adishankara.ac.in' : 'faculty@adishankara.ac.in'}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="login-password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-transparent dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="login-role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Role
              </label>
              <select
                id="login-role"
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-transparent dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
              >
                <option value="faculty">Faculty Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {loginError && (
              <p className="text-red-400 text-sm font-medium">{loginError}</p>
            )}

          

            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-md"
              type="button"
              disabled={loginLoading}
            >
              {loginLoading ? 'Signing In...' : `Sign In as ${loginRole === 'admin' ? 'Administrator' : 'Faculty Member'}`}
            </button>

            <div className="text-center space-y-2">
              <button
                onClick={() => setShowForgotModal(true)}
                className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition duration-200 block w-full"
                type="button"
              >
                Forgot Password?
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition duration-200"
                type="button"
              >
                Don't have an account? Register here
              </button>
            </div>
          </div>
        ) : (
          <div id="register-form" className="space-y-6 reveal-target">
            <div>
              <label
                htmlFor="register-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="register-name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-transparent dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dr. Rajesh Kumar"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="register-email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-transparent dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="faculty@adishankara.ac.in"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="register-collegeId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">College ID</label>
              <input
                type="text"
                id="register-collegeId"
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-transparent dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your College ID"
                value={registerCollegeId}
                onChange={e => setRegisterCollegeId(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="register-password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-transparent dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Minimum 8 characters"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="register-confirm"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="register-confirm"
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-transparent dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                value={registerConfirm}
                onChange={(e) => setRegisterConfirm(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="register-department"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Department
              </label>
              <select
                id="register-department"
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-transparent dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <p className="text-red-400 text-sm font-medium">{registerError}</p>
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
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition duration-200"
                type="button"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Forgot Password</h3>
                <button 
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail('');
                    setForgotError('');
                    setForgotMessage('');
                  }} 
                  className="text-gray-300 hover:text-white" 
                  type="button"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email Address</label>
                  <input 
                    type="email"
                    value={forgotEmail} 
                    onChange={e => setForgotEmail(e.target.value)} 
                    className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Enter your email address"
                  />
                </div>
                
                {forgotMessage && (
                  <div className="bg-green-500/15 border border-green-400/30 text-green-300 px-4 py-3 rounded-lg">
                    {forgotMessage}
                  </div>
                )}
                
                {forgotError && (
                  <div className="bg-red-500/15 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg">
                    {forgotError}
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail('');
                    setForgotError('');
                    setForgotMessage('');
                  }} 
                  className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10" 
                  type="button"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleForgotPassword} 
                  disabled={forgotLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="button"
                >
                  {forgotLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Email'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <div className="toast-item glass-panel rounded-lg px-4 py-3 text-sm text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
