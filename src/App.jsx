import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { FiMic, FiSave, FiTrash2, FiSquare, FiEdit2, FiFile, FiClock, FiLogOut, FiLoader, FiAlertCircle, FiHeadphones, FiChevronRight } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const api = axios.create({
  baseURL: API_URL,
});

const handleLogin = async (credentials, setToken, setUser, setError, setLoading, navigate) => {
  setLoading(true);
  setError(null);
  try {
    console.log("Attempting login with:", credentials.username);
    const response = await api.post('/auth/login', credentials);
    const { token: newToken, userId, username } = response.data;
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    console.log('Axios default Authorization header SET.');
    setToken(newToken);
    const userData = { userId, username };
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('Login successful:', userData);

    // --- DIAGNOSTIC: Add a small delay before navigating ---
    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
    console.log('Navigating after delay...');
    // --- END DIAGNOSTIC ---

    navigate('/dashboard'); 
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Login failed. Please check credentials.';
    console.error('Login failed:', errorMessage);
    setError(errorMessage);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

const handleRegister = async (userData, setError, setLoading, navigate) => {
  setLoading(true);
  setError(null);
  try {
    console.log("Attempting registration for:", userData.username);
    await api.post('/auth/register', userData);
    console.log('Registration successful');
    navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
    console.error('Registration failed:', errorMessage);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

const handleLogout = (setToken, setUser, navigate) => {
  console.log("Logging out...");

  // Clear the default header on the Axios instance
  delete api.defaults.headers.common['Authorization'];
  console.log('Axios default Authorization header CLEARED.');

  setToken(null);
  setUser(null);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('/login');
};

function LoginPage({ onLogin, loading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const message = location.state?.message; 

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 bg-black/30 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10">
        <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Welcome Back</h2>
        {message && <p className="text-center text-green-400 mb-4 bg-green-500/20 p-2 rounded">{message}</p>}
        {error && <p className="text-center text-red-400 mb-4 bg-red-500/20 p-2 rounded flex items-center justify-center"><FiAlertCircle className="mr-2"/>{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="login-username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-md text-white font-semibold transition duration-300 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <FiLoader className="animate-spin mr-2" /> : 'Log In'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-6">
          Don't have an account? <Link to="/register" className="text-purple-400 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}

function RegisterPage({ onRegister, loading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const location = useLocation();
  const message = location.state?.message; 

  const handleSubmit = (e) => {
    e.preventDefault();
    setRegisterError('');
    if (password !== confirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setRegisterError('Password must be at least 6 characters long.');
      return;
    }
    onRegister({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 bg-black/30 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10">
        <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Create Account</h2>
        {registerError && <p className="text-center text-red-400 mb-4 bg-red-500/20 p-2 rounded flex items-center justify-center"><FiAlertCircle className="mr-2"/>{registerError}</p>}
        {error && <p className="text-center text-red-400 mb-4 bg-red-500/20 p-2 rounded flex items-center justify-center"><FiAlertCircle className="mr-2"/>{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="reg-username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              placeholder="Create a password (min 6 chars)"
            />
          </div>
          <div>
            <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input
              id="reg-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              placeholder="Confirm your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-md text-white font-semibold transition duration-300 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <FiLoader className="animate-spin mr-2" /> : 'Register'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-purple-400 hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
}

function DashboardPage({ user, token, onLogout }) {
  const [entries, setEntries] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState(null); // ID of the entry being edited or viewed
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls within dashboard
  const [fetchError, setFetchError] = useState(null); // Error state for fetching entries
  const [saveError, setSaveError] = useState(null); // Error state for save/update/delete
  const recognitionRef = useRef(null);
  const textAreaRef = useRef(null);
  const navigate = useNavigate();

  // --- Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFetchError('Speech recognition not supported in this browser.');
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Append final transcript to the existing text or interim
      // Use functional update to ensure we're working with the latest state
      setCurrentText(prevText => prevText + finalTranscript);

      // Auto-scroll textarea
      if (textAreaRef.current) {
        textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
      }
    };

    recog.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setSaveError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recog.onend = () => {
      // Only log if it wasn't intentionally stopped
      if (isRecording) {
         console.log('Speech recognition service disconnected, attempting to restart');
         // Optional: auto-restart if desired, but manual stop is safer
         // if (isRecording) startRecording(); 
      }
    };

    recognitionRef.current = recog;

    // Cleanup function
    return () => {
      if (recog) {
        recog.stop();
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // --- Data Fetching ---
  useEffect(() => {
    // Fetch entries when component mounts or user changes
    const fetchEntries = async () => {
      if (!user?.userId) return; // Don't fetch if no user
      setIsLoading(true); // Use dashboard loading state
      setFetchError(null);
      console.log(`Fetching entries for user: ${user.username} with token presence: ${!!token}`); // Log token presence
      try {
        // Use the 'api' instance which includes the token interceptor
        const response = await api.get('/entries');
        console.log("Entries fetched:", response.data);
        setEntries(response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))); // Sort newest first
      } catch (error) {
        const errMsg = error.response?.data?.error || 'Failed to fetch entries.';
        console.error('Error fetching entries:', errMsg, error);
        setFetchError(errMsg);
        // If it's an auth error, the interceptor should handle logout/redirect
      } finally {
        setIsLoading(false); // Use dashboard loading state
      }
    };

    fetchEntries();
  }, [user, token]); // Dependency array includes user and token

  // --- Recording Controls ---
  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        console.log('Starting recording...');
        recognitionRef.current.start();
        setIsRecording(true);
        console.log('Recording started');
      } catch (error) {
        console.error('Error starting recording:', error);
        setSaveError('Failed to start recording. Check microphone permissions.');
      }
    } else {
      console.error('Error starting recording: Recognition not available or already recording');
      setSaveError('Failed to start recording. Check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      console.log('Stopping recording...');
      recognitionRef.current.stop();
      setIsRecording(false);
      // Final transcript is already in the transcript state via onresult
      console.log('Final transcript:', currentText);
      // If no currentEntryId, it's a new entry, prepare to save
      if (!currentEntryId) {
        // We don't auto-save here anymore, wait for user to click save
        // This allows editing before the first save
        setIsEditing(true); // Enter editing mode immediately after stopping
        setCurrentText(currentText);
      }
    }
  };

  // --- Entry Management ---
  const handleSave = async () => {
    if (!currentText.trim()) return; // Don't save empty entries
    setIsLoading(true);
    setSaveError(null);
    try {
      const newEntryData = {
        text: currentText,
        timestamp: new Date().toISOString(),
      };
      const response = await api.post('/entries', newEntryData);
      setEntries([response.data, ...entries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))); // Add and re-sort
      handleNewEntry(); // Clear the form for a new entry
      console.log('Entry saved:', response.data.id);
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to save entry.';
      console.error('Error saving entry:', errMsg);
      setSaveError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (entry) => {
    console.log('Editing entry:', entry.id);
    if (isRecording) stopRecording(); // Stop recording if active
    setCurrentEntryId(entry.id);
    setCurrentText(entry.text);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!currentEntryId || !currentText.trim()) return;
    setIsLoading(true);
    setSaveError(null);
    try {
      const updatedEntryData = {
        text: currentText,
        timestamp: new Date().toISOString(), // Optionally update timestamp on edit
      };
      const response = await api.put(`/entries/${currentEntryId}`, updatedEntryData);
      setEntries(entries.map(e => e.id === currentEntryId ? response.data : e).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))); // Update and re-sort
      handleNewEntry(); // Reset form after update
      console.log('Entry updated:', currentEntryId);
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to update entry.';
      console.error('Error updating entry:', errMsg);
      setSaveError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    setIsLoading(true);
    setSaveError(null);
    try {
      await api.delete(`/entries/${id}`);
      setEntries(entries.filter(e => e.id !== id)); // No need to sort after delete
      if (currentEntryId === id) {
        handleNewEntry(); // Clear form if the deleted entry was being viewed/edited
      }
      console.log('Entry deleted:', id);
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to delete entry.';
      console.error('Error deleting entry:', errMsg);
      setSaveError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEntry = (entry) => {
    if (isRecording) stopRecording();
    console.log('Selecting entry:', entry.id);
    setCurrentEntryId(entry.id);
    setCurrentText(entry.text); // Display the selected entry's text
    setIsEditing(false); // Not editing yet, just viewing
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see the editor
  };

  const handleNewEntry = () => {
    if (isRecording) stopRecording();
    console.log('Creating new entry space...');
    setCurrentEntryId(null);
    setCurrentText('');
    setIsEditing(false);
    // Maybe start recording immediately?
    // startRecording();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 text-white p-4 sm:p-6 md:p-8">
      {/* Header */} 
      <header className="flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Voice Journal
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300 hidden sm:inline">Welcome, {user?.username || 'User'}!</span>
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-1.5 bg-red-600/50 hover:bg-red-500/70 text-white rounded-md text-sm transition duration-200 border border-red-500/30 backdrop-blur-sm"
          >
            <FiLogOut className="mr-1.5" /> Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */} 
      <main className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Editor/Recorder */} 
        <div className="md:col-span-2 bg-black/30 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4 sm:p-6 flex flex-col">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-purple-300 border-b border-purple-500/20 pb-2">{isEditing ? 'Edit Entry' : 'New Journal Entry'}</h2>
          {saveError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-300 flex items-center">
              <FiAlertCircle className="mr-2 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}
          <textarea
            ref={textAreaRef}
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder={isRecording ? "Listening... speak clearly." : "Start typing or click the mic to record..."}
            className="w-full h-48 sm:h-64 md:h-80 flex-grow p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400 resize-none mb-4 text-sm sm:text-base"
            disabled={isRecording}
          />
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Recording Button */} 
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center justify-center px-4 py-2 rounded-md transition duration-200 text-sm sm:text-base w-full sm:w-auto border ${isRecording
                  ? 'bg-red-600/80 hover:bg-red-700/90 border-red-500/50 text-white backdrop-blur-sm'
                  : 'bg-purple-600/80 hover:bg-purple-700/90 border-purple-500/50 text-white backdrop-blur-sm'
                }`}
            >
              {isRecording ? <><FiSquare className="mr-2 animate-pulse" /> Stop Recording</> : <><FiMic className="mr-2" /> Start Recording</>}
            </button>

            {/* Action Buttons */} 
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <button
                  onClick={handleUpdate}
                  disabled={isLoading || isRecording || !currentText.trim()}
                  className="flex items-center px-4 py-2 bg-yellow-500/80 hover:bg-yellow-600/90 text-black rounded-md text-sm sm:text-base transition duration-200 disabled:opacity-50 border border-yellow-400/50 backdrop-blur-sm"
                >
                  {isLoading ? <FiLoader className="animate-spin mr-2"/> : <FiSave className="mr-2" />} Update
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isLoading || isRecording || !currentText.trim()}
                  className="flex items-center px-4 py-2 bg-green-500/80 hover:bg-green-600/90 text-white rounded-md text-sm sm:text-base transition duration-200 disabled:opacity-50 border border-green-400/50 backdrop-blur-sm"
                >
                  {isLoading ? <FiLoader className="animate-spin mr-2"/> : <FiSave className="mr-2" />} Save Entry
                </button>
              )}
              <button
                onClick={handleNewEntry} // Cancel edit or clear new entry
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-gray-500/50 hover:bg-gray-600/60 text-white rounded-md text-sm sm:text-base transition duration-200 border border-gray-400/30 backdrop-blur-sm"
              >
                <FiFile className="mr-2" /> {isEditing ? 'Cancel' : 'Clear'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Entry List */} 
        <div className="md:col-span-1 bg-black/20 backdrop-blur-md rounded-xl shadow-xl border border-white/10 p-4 sm:p-6 overflow-hidden flex flex-col h-[70vh] md:h-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-purple-300 border-b border-purple-500/20 pb-2 flex-shrink-0">
            Journal History
          </h2>
          {/* Loading State */} 
          {isLoading && entries.length === 0 && (
             <div className="flex-grow flex items-center justify-center text-gray-400">
                <FiLoader className="animate-spin mr-3 text-2xl" /> Loading entries...
             </div>
          )}
          {/* Error State */} 
          {fetchError && (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-red-400 bg-red-900/30 p-4 rounded-lg">
                <FiAlertCircle className="text-4xl mb-2" />
                <p className="font-semibold">Error Loading Entries</p>
                <p className="text-sm">{fetchError}</p>
            </div>
          )}
          {/* Entries List */} 
          {!isLoading && !fetchError && (
            <div className="space-y-3 flex-grow overflow-y-auto pr-2 pb-2" style={{ scrollbarWidth: 'thin' }}> 
               {entries.length > 0 ? (
                 entries.map(entry => (
                   <div
                     key={entry.id}
                     onClick={() => handleSelectEntry(entry)}
                     className={`p-3 sm:p-4 rounded-lg cursor-pointer transition duration-200 border ${currentEntryId === entry.id ? 'bg-purple-900/50 border-purple-500' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
                   >
                     <p className="text-sm sm:text-base text-gray-200 line-clamp-2 mb-1 sm:mb-2">{entry.text}</p>
                     <div className="flex justify-between items-center text-xs text-gray-400">
                       <span className="flex items-center">
                         <FiClock className="mr-1" />
                         {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                       </span>
                       <div className="flex space-x-2 text-sm">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(entry); }} className="hover:text-yellow-400"><FiEdit2 /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} className="hover:text-red-400"><FiTrash2 /></button>
                       </div>
                     </div>
                   </div>
                 ))
               ) : (
                 <p className="text-gray-400 text-center italic mt-6 flex items-center justify-center">No journal entries found.</p>
               )}
             </div>
           )}
        </div>
      </main>

      {/* Footer */} 
      <footer className="mt-8 text-center text-gray-500 text-xs flex-shrink-0 pb-2">
        <p>Voice Journal &copy; 2025 - Dashboard</p>
      </footer>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="py-6 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiHeadphones className="text-2xl text-purple-400" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Voice Journal</h1>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">Sign Up</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-4 md:p-12 gap-8">
        <div className="md:w-1/2 max-w-xl space-y-6 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            <span className="block">Capture Your Thoughts</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">With Your Voice</span>
          </h2>
          <p className="text-lg text-gray-300">
            Record, organize, and revisit your thoughts effortlessly. Our voice journal transforms your spoken words into searchable text entries.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => navigate('/register')} 
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center mx-auto md:mx-0"
            >
              Get Started <FiChevronRight className="ml-2" />
            </button>
          </div>
          <p className="text-sm text-gray-400">Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 underline">Log in</Link></p>
        </div>
        <div className="md:w-1/2 max-w-md">
          <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-xs text-gray-400">Voice Journal App</div>
            </div>
            <div className="space-y-4 py-3">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-700/50 p-2 rounded-full">
                  <FiMic className="text-lg" />
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3 flex-grow">
                  <p className="text-sm">"Today I had a breakthrough on my project..."</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-700/50 p-2 rounded-full">
                  <FiFile className="text-lg" />
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3 flex-grow">
                  <div className="text-xs text-gray-400 mb-1">May 3, 2025</div>
                  <p className="text-sm">Ideas for weekend project: 1) Create user dashboard 2) Add voice recording feature 3) Implement search functionality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-gray-500 text-sm border-t border-gray-800">
        <p>Voice Journal &copy; 2025 - All rights reserved</p>
      </footer>
    </div>
  );
}

function ProtectedRoute({ token, children }) {
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('user'); 
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const initialToken = localStorage.getItem('token');
    if (initialToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
      console.log('Axios default Authorization header SET on initial load.');
    }
  }, []); // Run only once on initial app load

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const currentToken = token || localStorage.getItem('token');
        if (currentToken && !config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${currentToken}`;
          console.log('Interceptor ADDED Authorization header as fallback.');
        } else {
          // console.warn('Interceptor: No token found or header already set.');
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.error('Auth Error (Interceptor): Unauthorized/Forbidden. Logging out.');
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthError(error.response.data?.error || 'Session expired or invalid. Please log in again.');
          if (window.location.pathname !== '/login') {
            navigate('/login');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, setToken, setUser]);

  const loginHandler = (credentials) => {
    setAuthError(null); 
    handleLogin(credentials, setToken, setUser, setAuthError, setIsLoading, navigate);
  };

  const registerHandler = (userData) => {
    setAuthError(null); 
    handleRegister(userData, setAuthError, setIsLoading, navigate);
  };

  const logoutHandler = () => {
    handleLogout(setToken, setUser, navigate);
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={token ? <Navigate to="/dashboard" /> : <LoginPage onLogin={loginHandler} loading={isLoading} error={authError} />} 
      />
      <Route 
        path="/register" 
        element={token ? <Navigate to="/dashboard" /> : <RegisterPage onRegister={registerHandler} loading={isLoading} error={authError} />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute token={token}>
            {/* Pass token down to DashboardPage */} 
            <DashboardPage user={user} token={token} onLogout={logoutHandler} />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={token ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default App;