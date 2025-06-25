import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { FiMic, FiSave, FiTrash2, FiSquare, FiEdit2, FiFile, FiClock, FiLogOut, FiLoader, FiAlertCircle, FiHeadphones, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { UIProvider, useUI } from './contexts/UIContext';
import { GlobalUI } from './components/GlobalUI';
import {
  AnimatedPage,
  StaggerContainer,
  AnimatedListItem,
  FadeIn,
  SlideUp,
  SlideDown,
  SlideLeft,
  SlideRight,
  ScaleIn,
  AnimatedButton,
  AnimatedIconButton,
  AnimatedRecordingButton,
  AnimatedCard,
  AnimatedInput,
  AnimatedTextarea,
  AnimatedSpinner,
  AnimatedWaveform,
  AnimatedRecordingStatus,
  AnimatedMicIcon,
  AnimatedRecordingTimer,
  PageTransition,
  InteractiveElement,
  RippleEffect
} from './components/AnimatedComponents';
import { EnhancedLoginForm, EnhancedRegisterForm } from './components/EnhancedAuthForms';
import { ForgotPasswordForm, ResetPasswordForm } from './components/ForgotPasswordForm';
import { useScrollAnimation, useAnimations } from './hooks/useAnimations';

// Use Vite's proxy configuration for API calls
const API_URL = import.meta.env.VITE_API_URL || '/api';
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

    // Handle token storage based on remember me preference
    if (credentials.rememberMe) {
      // Store token in localStorage for persistent login (longer expiration)
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('rememberedUsername', credentials.username);
      console.log('Login with Remember Me - token stored persistently');
    } else {
      // Store token in sessionStorage for session-only login
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('user', JSON.stringify(userData));
      // Clear any previous remember me data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedUsername');
      console.log('Login without Remember Me - token stored for session only');
    }

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
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

const handleRegister = async (userData, setError, setLoading, navigate, setToken, setUser) => {
  setLoading(true);
  setError(null);
  try {
    console.log("Attempting registration for:", userData.username);
    await api.post('/auth/register', userData);
    console.log('Registration successful');

    // Automatically log the user in after successful registration
    console.log("Auto-logging in after registration...");
    const loginResponse = await api.post('/auth/login', {
      username: userData.username,
      password: userData.password,
      rememberMe: false // Default to session-only for auto-login
    });

    const { token: newToken, userId, username } = loginResponse.data;
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    console.log('Auto-login successful after registration');

    setToken(newToken);
    const userDataObj = { userId, username };
    setUser(userDataObj);

    // Store token in sessionStorage for session-only login
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(userDataObj));

    // Clear any previous remember me data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberedUsername');

    console.log('Registration and auto-login successful:', userDataObj);
    navigate('/dashboard');

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

  // Clear tokens from both localStorage and sessionStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');

  // Keep remember me data for next login if it was set
  // localStorage.removeItem('rememberMe');
  // localStorage.removeItem('rememberedUsername');

  navigate('/login');
};

function LoginPage({ onLogin, loading, error }) {
  return <EnhancedLoginForm onLogin={onLogin} />;
}

function RegisterPage({ onRegister, loading, error }) {
  return <EnhancedRegisterForm onRegister={onRegister} />;
}

function DashboardPage({ user, token, onLogout }) {
  const [entries, setEntries] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState(null); // ID of the entry being edited or viewed
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls within dashboard
  const [fetchError, setFetchError] = useState(null); // Error state for fetching entries
  const [saveError, setSaveError] = useState(null); // Error state for save/update/delete

  // Use UI context for global notifications
  const { showSuccess, showError, showWarning } = useUI();
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
        setRecordingStartTime(Date.now());
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
      setRecordingStartTime(null);
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
    if (!currentText.trim()) {
      showWarning('Please enter some text before saving.');
      return;
    }
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
      showSuccess('Journal entry saved successfully!');
      console.log('Entry saved:', response.data.id);
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to save entry.';
      console.error('Error saving entry:', errMsg);
      setSaveError(errMsg);
      showError(errMsg);
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
    if (!currentEntryId || !currentText.trim()) {
      showWarning('Please enter some text before updating.');
      return;
    }
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
      showSuccess('Journal entry updated successfully!');
      console.log('Entry updated:', currentEntryId);
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to update entry.';
      console.error('Error updating entry:', errMsg);
      setSaveError(errMsg);
      showError(errMsg);
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
      showSuccess('Journal entry deleted successfully!');
      console.log('Entry deleted:', id);
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to delete entry.';
      console.error('Error deleting entry:', errMsg);
      setSaveError(errMsg);
      showError(errMsg);
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
    <AnimatedPage className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 text-white p-4 sm:p-6 md:p-8">
      {/* Header */}
      <SlideDown>
        <header className="flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-white/10">
          <motion.h1
            className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Voice Journal
          </motion.h1>
          <div className="flex items-center space-x-4">
            <motion.span
              className="text-sm text-gray-300 hidden sm:inline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Welcome, {user?.username || 'User'}!
            </motion.span>
            <AnimatedButton
              onClick={onLogout}
              className="flex items-center px-3 py-1.5 bg-red-600/50 hover:bg-red-500/70 text-white rounded-md text-sm transition duration-200 border border-red-500/30 backdrop-blur-sm"
            >
              <FiLogOut className="mr-1.5" /> Logout
            </AnimatedButton>
          </div>
        </header>
      </SlideDown>

      {/* Main Content Area */}
      <main className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Editor/Recorder */}
        <SlideLeft delay={0.2}>
          <AnimatedCard className="md:col-span-2 bg-black/30 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4 sm:p-6 flex flex-col" hoverable={false}>
            <motion.h2
              className="text-xl sm:text-2xl font-semibold mb-4 text-purple-300 border-b border-purple-500/20 pb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {isEditing ? 'Edit Entry' : 'New Journal Entry'}
            </motion.h2>

            <AnimatePresence>
              {saveError && (
                <motion.div
                  className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-300 flex items-center"
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <FiAlertCircle className="mr-2 flex-shrink-0" />
                  </motion.div>
                  <span>{saveError}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative mb-4"
            >
              <AnimatedTextarea
                ref={textAreaRef}
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder={isRecording ? "Listening... speak clearly." : "Start typing or click the mic to record..."}
                className={`w-full h-48 sm:h-64 md:h-80 flex-grow p-3 sm:p-4 rounded-lg border resize-none text-sm sm:text-base transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-900/10 border-red-500/30 text-gray-100 placeholder-red-300/50 shadow-lg shadow-red-500/10'
                    : 'bg-white/5 border-white/10 text-gray-100 placeholder-gray-400 focus:ring-purple-500 focus:border-transparent'
                }`}
                disabled={isRecording}
              />

              {/* Recording Overlay Effect */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 pointer-events-none rounded-lg"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(239, 68, 68, 0.1) 50%, transparent 70%)',
                      backgroundSize: '200% 200%',
                    }}
                  >
                    <motion.div
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="w-full h-full rounded-lg"
                      style={{
                        background: 'inherit',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {/* Recording Section */}
              <div className="flex flex-col items-center space-y-3 w-full sm:w-auto">
                {/* Recording Status and Timer */}
                <div className="flex flex-col items-center space-y-2">
                  <AnimatedRecordingStatus
                    isRecording={isRecording}
                  />
                  <AnimatedRecordingTimer
                    isRecording={isRecording}
                    startTime={recordingStartTime}
                  />
                </div>

                {/* Recording Button with Enhanced Visuals */}
                <div className="flex items-center space-x-4">
                  <RippleEffect
                    rippleColor={isRecording ? "rgba(239, 68, 68, 0.4)" : "rgba(147, 51, 234, 0.4)"}
                    className="rounded-full"
                  >
                    <AnimatedRecordingButton
                      onClick={isRecording ? stopRecording : startRecording}
                      isRecording={isRecording}
                      className={`flex items-center justify-center px-6 py-3 rounded-full transition duration-200 text-sm sm:text-base border-2 ${isRecording
                          ? 'bg-red-600/80 hover:bg-red-700/90 border-red-500/50 text-white backdrop-blur-sm shadow-lg shadow-red-500/30'
                          : 'bg-purple-600/80 hover:bg-purple-700/90 border-purple-500/50 text-white backdrop-blur-sm shadow-lg shadow-purple-500/30'
                        }`}
                    >
                      <AnimatedMicIcon
                        isRecording={isRecording}
                        className="mr-2"
                        size={20}
                      />
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </AnimatedRecordingButton>
                  </RippleEffect>

                  {/* Waveform Visualization */}
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AnimatedWaveform
                        isRecording={isRecording}
                        bars={7}
                        className="ml-4"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <AnimatedButton
                    onClick={handleUpdate}
                    disabled={isLoading || isRecording || !currentText.trim()}
                    className="flex items-center px-4 py-2 bg-yellow-500/80 hover:bg-yellow-600/90 text-black rounded-md text-sm sm:text-base transition duration-200 disabled:opacity-50 border border-yellow-400/50 backdrop-blur-sm"
                  >
                    {isLoading ? (
                      <AnimatedSpinner size="sm" className="mr-2" color="text-black" />
                    ) : (
                      <FiSave className="mr-2" />
                    )}
                    Update
                  </AnimatedButton>
                ) : (
                  <AnimatedButton
                    onClick={handleSave}
                    disabled={isLoading || isRecording || !currentText.trim()}
                    className="flex items-center px-4 py-2 bg-green-500/80 hover:bg-green-600/90 text-white rounded-md text-sm sm:text-base transition duration-200 disabled:opacity-50 border border-green-400/50 backdrop-blur-sm"
                  >
                    {isLoading ? (
                      <AnimatedSpinner size="sm" className="mr-2" color="text-white" />
                    ) : (
                      <FiSave className="mr-2" />
                    )}
                    Save Entry
                  </AnimatedButton>
                )}
                <AnimatedButton
                  onClick={handleNewEntry} // Cancel edit or clear new entry
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-gray-500/50 hover:bg-gray-600/60 text-white rounded-md text-sm sm:text-base transition duration-200 border border-gray-400/30 backdrop-blur-sm"
                >
                  <FiFile className="mr-2" /> {isEditing ? 'Cancel' : 'Clear'}
                </AnimatedButton>
              </div>
            </motion.div>
          </AnimatedCard>
        </SlideLeft>

        {/* Right Column: Entry List */}
        <SlideRight delay={0.4}>
          <AnimatedCard className="md:col-span-1 bg-black/20 backdrop-blur-md rounded-xl shadow-xl border border-white/10 p-4 sm:p-6 overflow-hidden flex flex-col h-[70vh] md:h-auto" hoverable={false}>
            <motion.h2
              className="text-xl sm:text-2xl font-semibold mb-4 text-purple-300 border-b border-purple-500/20 pb-2 flex-shrink-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Journal History
            </motion.h2>

            {/* Loading State */}
            <AnimatePresence>
              {isLoading && entries.length === 0 && (
                <motion.div
                  className="flex-grow flex items-center justify-center text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedSpinner size="lg" className="mr-3" color="text-gray-400" />
                  Loading entries...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error State */}
            <AnimatePresence>
              {fetchError && (
                <motion.div
                  className="flex-grow flex flex-col items-center justify-center text-center text-red-400 bg-red-900/30 p-4 rounded-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <FiAlertCircle className="text-4xl mb-2" />
                  </motion.div>
                  <p className="font-semibold">Error Loading Entries</p>
                  <p className="text-sm">{fetchError}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Entries List */}
            {!isLoading && !fetchError && (
              <motion.div
                className="space-y-3 flex-grow overflow-y-auto pr-2 pb-2"
                style={{ scrollbarWidth: 'thin' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {entries.length > 0 ? (
                  <StaggerContainer staggerDelay={0.1}>
                    {entries.map((entry, index) => (
                      <InteractiveElement
                        key={entry.id}
                        onClick={() => handleSelectEntry(entry)}
                        className={`p-3 sm:p-4 rounded-lg transition duration-200 border ${currentEntryId === entry.id ? 'bg-purple-900/50 border-purple-500' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
                        hoverScale={1.02}
                        tapScale={0.98}
                      >
                        <motion.div layout>
                          <p className="text-sm sm:text-base text-gray-200 line-clamp-2 mb-1 sm:mb-2">{entry.text}</p>
                          <div className="flex justify-between items-center text-xs text-gray-400">
                            <span className="flex items-center">
                              <FiClock className="mr-1" />
                              {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                            <div className="flex space-x-2 text-sm">
                              <RippleEffect
                                rippleColor="rgba(251, 191, 36, 0.3)"
                                className="rounded"
                              >
                                <AnimatedButton
                                  onClick={(e) => { e.stopPropagation(); handleEdit(entry); }}
                                  className="hover:text-yellow-400 bg-transparent border-none p-1"
                                >
                                  <FiEdit2 />
                                </AnimatedButton>
                              </RippleEffect>
                              <RippleEffect
                                rippleColor="rgba(239, 68, 68, 0.3)"
                                className="rounded"
                              >
                                <AnimatedButton
                                  onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                  className="hover:text-red-400 bg-transparent border-none p-1"
                                >
                                  <FiTrash2 />
                                </AnimatedButton>
                              </RippleEffect>
                            </div>
                          </div>
                        </motion.div>
                      </InteractiveElement>
                    ))}
                  </StaggerContainer>
                ) : (
                  <motion.p
                    className="text-gray-400 text-center italic mt-6 flex items-center justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                  >
                    No journal entries found.
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatedCard>
        </SlideRight>
      </main>

      {/* Footer */}
      <motion.footer
        className="mt-8 text-center text-gray-500 text-xs flex-shrink-0 pb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <p>Voice Journal &copy; 2025 - Dashboard</p>
      </motion.footer>
    </AnimatedPage>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const { ref: heroRef, isInView: heroInView } = useScrollAnimation(0.2);
  const { ref: featuresRef, isInView: featuresInView } = useScrollAnimation(0.3);

  return (
    <AnimatedPage className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <SlideDown>
        <header className="py-6 px-4 md:px-8 flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <FiHeadphones className="text-2xl text-purple-400" />
            </motion.div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Voice Journal</h1>
          </motion.div>
          <div className="space-x-4">
            <AnimatedButton
              onClick={() => navigate('/login')}
              className="text-gray-300 hover:text-white transition-colors bg-transparent border-none"
            >
              Login
            </AnimatedButton>
            <AnimatedButton
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
            >
              Sign Up
            </AnimatedButton>
          </div>
        </header>
      </SlideDown>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-4 md:p-12 gap-8" ref={heroRef}>
        <StaggerContainer className="md:w-1/2 max-w-xl space-y-6 text-center md:text-left">
          <AnimatedListItem>
            <motion.h2
              className="text-4xl md:text-5xl font-bold leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -20 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Capture Your Thoughts
              </motion.span>
              <motion.span
                className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500"
                initial={{ opacity: 0, x: 20 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                With Your Voice
              </motion.span>
            </motion.h2>
          </AnimatedListItem>

          <AnimatedListItem>
            <motion.p
              className="text-lg text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Record, organize, and revisit your thoughts effortlessly. Our voice journal transforms your spoken words into searchable text entries.
            </motion.p>
          </AnimatedListItem>

          <AnimatedListItem>
            <motion.div
              className="pt-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <AnimatedButton
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center mx-auto md:mx-0 group"
              >
                Get Started
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <FiChevronRight />
                </motion.div>
              </AnimatedButton>
            </motion.div>
          </AnimatedListItem>

          <AnimatedListItem>
            <motion.p
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Already have an account?
              <AnimatedButton
                onClick={() => navigate('/login')}
                className="text-purple-400 hover:text-purple-300 underline bg-transparent border-none ml-1"
              >
                Log in
              </AnimatedButton>
            </motion.p>
          </AnimatedListItem>
        </StaggerContainer>
        <motion.div
          className="md:w-1/2 max-w-md"
          initial={{ opacity: 0, x: 50 }}
          animate={heroInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <AnimatedCard className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/10 shadow-2xl hover:shadow-purple-500/20">
            <motion.div
              className="flex items-center justify-between mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-3 h-3 rounded-full bg-red-500"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="w-3 h-3 rounded-full bg-yellow-500"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
                <motion.div
                  className="w-3 h-3 rounded-full bg-green-500"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                />
              </div>
              <div className="text-xs text-gray-400">Voice Journal App</div>
            </motion.div>

            <div className="space-y-4 py-3">
              <motion.div
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <motion.div
                  className="bg-purple-700/50 p-2 rounded-full"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiMic className="text-lg" />
                </motion.div>
                <motion.div
                  className="bg-gray-800/60 rounded-lg p-3 flex-grow"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm">"Today I had a breakthrough on my project..."</p>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <motion.div
                  className="bg-purple-700/50 p-2 rounded-full"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiFile className="text-lg" />
                </motion.div>
                <motion.div
                  className="bg-gray-800/60 rounded-lg p-3 flex-grow"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-xs text-gray-400 mb-1">May 3, 2025</div>
                  <p className="text-sm">Ideas for weekend project: 1) Create user dashboard 2) Add voice recording feature 3) Implement search functionality</p>
                </motion.div>
              </motion.div>
            </div>
          </AnimatedCard>
        </motion.div>
      </main>

      {/* Footer */}
      <SlideUp delay={1.5}>
        <footer className="py-6 px-4 text-center text-gray-500 text-sm border-t border-gray-800">
          <motion.p
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Voice Journal &copy; 2025 - All rights reserved
          </motion.p>
        </footer>
      </SlideUp>
    </AnimatedPage>
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
  // Check both localStorage and sessionStorage for token
  const getStoredToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
  };

  const getStoredUser = () => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from storage", e);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      return null;
    }
  };

  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const initialToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (initialToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
      console.log('Axios default Authorization header SET on initial load.');
    }
  }, []); // Run only once on initial app load

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const currentToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
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
    handleRegister(userData, setAuthError, setIsLoading, navigate, setToken, setUser);
  };

  const logoutHandler = () => {
    handleLogout(setToken, setUser, navigate);
  };

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <PageTransition><LoginPage onLogin={loginHandler} loading={isLoading} error={authError} /></PageTransition>}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" /> : <PageTransition><RegisterPage onRegister={registerHandler} loading={isLoading} error={authError} /></PageTransition>}
        />
        <Route
          path="/forgot-password"
          element={token ? <Navigate to="/dashboard" /> : <PageTransition><ForgotPasswordForm /></PageTransition>}
        />
        <Route
          path="/reset-password"
          element={token ? <Navigate to="/dashboard" /> : <PageTransition><ResetPasswordForm /></PageTransition>}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute token={token}>
              <PageTransition>
                <DashboardPage user={user} token={token} onLogout={logoutHandler} />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <PageTransition><LandingPage /></PageTransition>} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} replace />} />
      </Routes>
      <GlobalUI />
    </>
  );
}

// Wrapper component with UIProvider
function AppWithProviders() {
  return (
    <UIProvider>
      <App />
    </UIProvider>
  );
}

export default AppWithProviders;