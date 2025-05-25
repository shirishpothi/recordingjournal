import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App'; 
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// This object will represent the mocked 'api' instance's methods and properties
// It's defined at the top-level so it's available when vi.mock's factory is evaluated.
const mockedApiInstanceMethods = {
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock('axios', () => ({
  default: {
    // When App.jsx calls axios.create(), it will get our mockedApiInstanceMethods object.
    create: vi.fn(() => mockedApiInstanceMethods), 
    // These are for if any code calls axios.get() directly (App.jsx uses the created 'api' instance)
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard', state: null }),
  };
});

const mockSpeechRecognitionInstance = {
  start: vi.fn(),
  stop: vi.fn(),
  onresult: null,
  onerror: null,
  onend: null,
  continuous: false,
  interimResults: false,
  lang: '',
};
global.SpeechRecognition = vi.fn(() => mockSpeechRecognitionInstance);
global.webkitSpeechRecognition = global.SpeechRecognition;

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

global.confirm = vi.fn(() => true);

const renderDashboard = () => {
  localStorageMock.setItem('token', 'test-token');
  localStorageMock.setItem('user', JSON.stringify({ userId: 'test-user-id', username: 'testuser' }));
  
  // Default behavior for the initial GET request by the 'api' instance
  mockedApiInstanceMethods.get.mockResolvedValue({ data: [] });

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/*" element={<App />} /> 
      </Routes>
    </MemoryRouter>
  );
};

describe('DashboardPage Message Exclusivity', () => {
  beforeEach(() => {
    vi.clearAllMocks(); 
    localStorageMock.clear(); 
    
    // Reset methods and properties of the shared mock instance
    mockedApiInstanceMethods.get.mockReset();
    mockedApiInstanceMethods.post.mockReset();
    mockedApiInstanceMethods.put.mockReset();
    mockedApiInstanceMethods.delete.mockReset();
    mockedApiInstanceMethods.interceptors.request.use.mockClear();
    mockedApiInstanceMethods.interceptors.response.use.mockClear();
    mockedApiInstanceMethods.defaults.headers.common = {}; 

    mockSpeechRecognitionInstance.start.mockReset();
    mockSpeechRecognitionInstance.stop.mockReset();
    mockSpeechRecognitionInstance.onresult = null;
    mockSpeechRecognitionInstance.onerror = null;
    mockSpeechRecognitionInstance.onend = null;
  });

  test('should display success message and hide error/warning messages on successful save', async () => {
    mockedApiInstanceMethods.post.mockResolvedValue({ 
      data: { id: 'new-entry-1', text: 'Test entry saved', timestamp: new Date().toISOString() } 
    });
    
    renderDashboard();
    
    const textarea = await screen.findByPlaceholderText(/Start typing or click the mic to record.../i);
    fireEvent.change(textarea, { target: { value: 'Test entry saved' } });

    const saveButton = screen.getByRole('button', { name: /Save Entry/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Entry saved successfully!')).toBeInTheDocument();
    });
    expect(screen.queryByText(/Failed to save entry/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Custom API Error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Speech recognition stopped unexpectedly/i)).not.toBeInTheDocument();
  });

  test('should display error message and hide success/warning messages on failed save', async () => {
    mockedApiInstanceMethods.post.mockRejectedValue({ response: { data: { error: 'Custom API Error' } } });

    renderDashboard();

    const textarea = await screen.findByPlaceholderText(/Start typing or click the mic to record.../i);
    fireEvent.change(textarea, { target: { value: 'Test entry for error' } });
    
    const saveButton = screen.getByRole('button', { name: /Save Entry/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Custom API Error/i)).toBeInTheDocument(); 
    });
    expect(screen.queryByText(/Entry saved successfully!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Speech recognition stopped unexpectedly/i)).not.toBeInTheDocument();
  });
  
  test('should display warning from onend (after retries) and hide success/error messages', async () => {
    renderDashboard(); 

    const startButton = await screen.findByRole('button', { name: /Start Recording/i });
    
    fireEvent.click(startButton);
    expect(mockedApiInstanceMethods.get).toHaveBeenCalledTimes(1); 
    expect(mockSpeechRecognitionInstance.start).toHaveBeenCalledTimes(1);
    
    if (mockSpeechRecognitionInstance.onend) mockSpeechRecognitionInstance.onend();
    expect(mockSpeechRecognitionInstance.start).toHaveBeenCalledTimes(2);

    if (mockSpeechRecognitionInstance.onend) mockSpeechRecognitionInstance.onend();
    expect(mockSpeechRecognitionInstance.start).toHaveBeenCalledTimes(3);
    
    if (mockSpeechRecognitionInstance.onend) mockSpeechRecognitionInstance.onend(); 
    expect(mockSpeechRecognitionInstance.start).toHaveBeenCalledTimes(3); 

    await waitFor(() => {
      expect(screen.getByText("Speech recognition stopped unexpectedly and could not be restarted. Please start it manually.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Entry saved successfully!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Failed to save entry/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Custom API Error/i)).not.toBeInTheDocument();
  });
});

describe('App Component Basic Rendering', () => {
  test('renders login page when no token is present', async () => {
    localStorageMock.removeItem('token');
    localStorageMock.removeItem('user');
    
    mockedApiInstanceMethods.get.mockResolvedValue({ data: [] }); 

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });
  });
});
