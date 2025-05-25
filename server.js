// Backend: server.js
const express = require('express');
const fs = require('fs').promises; // Use promises version of fs
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT
const { v4: uuidv4 } = require('uuid'); // For user IDs

// Environment variables
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATA_FILE = path.join(__dirname, 'entries.json');
const USERS_FILE = path.join(__dirname, 'users.json'); // Path for users file
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret'; // IMPORTANT: Use env var in production!

// Initialize express app
const app = express();

// Configure CORS - this can be adjusted for production
const corsOptions = {
  origin: NODE_ENV === 'production'
    ? ['https://yourfrontendapp.com'] // Update with your production domain
    : true, // Allow all origins in development (e.g., browser preview proxy)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// --- User Helper Functions ---

const readUsers = async () => {
  try {
    await fs.access(USERS_FILE); // Check if file exists
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') { // File does not exist
      console.log('users.json not found, creating and returning empty object.');
      await writeUsers({}); // Create the file with an empty object
      return {};
    } else {
      console.error('Error reading users file:', error);
      throw new Error('Failed to read user data');
    }
  }
};

const writeUsers = async (users) => {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    throw new Error('Failed to write user data');
  }
};

// --- Entry Helper Functions (Modified for User-Specific Data) ---

// Reads the entire entries structure
const readAllEntriesData = async () => {
  try {
    await fs.access(DATA_FILE); // Check if file exists
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') { // File does not exist
       console.log('entries.json not found, creating and returning empty object.');
       await writeAllEntriesData({}); // Create the file with an empty object
       return {};
    } else {
      console.error('Error reading entries file:', error);
      throw new Error('Failed to read entry data');
    }
  }
};

// Writes the entire entries structure
const writeAllEntriesData = async (allEntries) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(allEntries, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing entries file:', error);
    throw new Error('Failed to write entry data');
  }
};

// --- Authentication Middleware ---

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT Verification Error:', err.message);
        // Differentiate between expired and invalid tokens
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
        } else {
          return res.status(403).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
        }
      }
      // Add userId to request object
      req.userId = decoded.userId;
      console.log(`Authenticated user: ${req.userId}`);
      next();
    });
  } else {
    // Forbidden
    console.log('Authorization header missing');
    res.status(401).json({ error: 'Authorization required', code: 'NO_TOKEN' });
  }
};


// --- Auth API Routes ---

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const users = await readUsers();

    // Check if username already exists (case-insensitive check)
    const existingUser = Object.values(users).find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4(); // Generate unique user ID

    // Store new user
    users[userId] = { userId, username, password: hashedPassword };
    await writeUsers(users);

    console.log(`User registered: ${username} (ID: ${userId})`);
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    // Log the specific error encountered
    console.error('Registration Error Caught:', error); // More detailed log
    // Log what's being sent to the client
    const errorMessage = error.message || 'Failed to register user due to an internal server error.';
    console.error('Sending 500 error to client:', errorMessage);
    res.status(500).json({ error: errorMessage }); // Send the more specific message if available
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = await readUsers();

    // Find user by username (case-insensitive)
    const user = Object.values(users).find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      console.log(`Login failed: Username not found - ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' }); // Generic error
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Login failed: Incorrect password for user - ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' }); // Generic error
    }

    // Generate JWT
    const payload = { userId: user.userId, username: user.username }; // Include username for potential frontend use
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    console.log(`User logged in: ${username} (ID: ${user.userId})`);
    res.json({ token, userId: user.userId, username: user.username }); // Send token and basic user info

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Failed to login' });
  }
});


// --- Journal Entry API Routes (Now Require Auth) ---

// Get all entries for the logged-in user
app.get('/api/entries', verifyToken, async (req, res) => {
  try {
    const allEntriesData = await readAllEntriesData();
    const userEntries = allEntriesData[req.userId] || []; // Get entries for this user, default to empty array
    res.json(userEntries);
  } catch (error) {
    console.error(`Error fetching entries for user ${req.userId}:`, error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Save new entry for the logged-in user
app.post('/api/entries', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const allEntriesData = await readAllEntriesData();
    const userEntries = allEntriesData[userId] || [];

    const newEntry = {
      id: uuidv4(), // Generate new ID using uuidv4
      text: req.body.text,
      timestamp: req.body.timestamp || new Date().toISOString(),
    };

    userEntries.push(newEntry);
    allEntriesData[userId] = userEntries; // Update the main data structure

    await writeAllEntriesData(allEntriesData);
    console.log(`Entry ${newEntry.id} saved for user ${userId}`);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error(`Error saving entry for user ${req.userId}:`, error);
    res.status(500).json({ error: error.message || 'Failed to save entry' });
  }
});

// Update existing entry for the logged-in user
app.put('/api/entries/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const entryId = req.params.id;
    const allEntriesData = await readAllEntriesData();
    const userEntries = allEntriesData[userId] || [];

    const entryIndex = userEntries.findIndex(entry => entry.id === entryId);

    if (entryIndex === -1) {
       console.log(`Update failed: Entry ${entryId} not found for user ${userId}`);
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Update the existing entry
    const updatedEntry = {
      ...userEntries[entryIndex],
      text: req.body.text,
      timestamp: req.body.timestamp || new Date().toISOString()
    };

    userEntries[entryIndex] = updatedEntry;
    allEntriesData[userId] = userEntries; // Update the main data structure

    await writeAllEntriesData(allEntriesData);
    console.log(`Entry ${entryId} updated for user ${userId}`);
    res.json(updatedEntry);

  } catch (error) {
    console.error(`Error updating entry ${req.params.id} for user ${req.userId}:`, error);
    res.status(500).json({ error: error.message || 'Failed to update entry' });
  }
});

// Delete entry for the logged-in user
app.delete('/api/entries/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const entryId = req.params.id;
    const allEntriesData = await readAllEntriesData();
    const userEntries = allEntriesData[userId] || [];
    const initialCount = userEntries.length;

    const filteredEntries = userEntries.filter(entry => entry.id !== entryId);

    if (filteredEntries.length === initialCount) {
      console.log(`Delete failed: Entry ${entryId} not found for user ${userId}`);
      return res.status(404).json({ error: 'Entry not found' });
    }

    allEntriesData[userId] = filteredEntries; // Update the main data structure

    await writeAllEntriesData(allEntriesData);
    console.log(`Entry ${entryId} deleted for user ${userId}`);
    res.json({ message: 'Entry deleted successfully' });

  } catch (error) {
    console.error(`Error deleting entry ${req.params.id} for user ${req.userId}:`, error);
    res.status(500).json({ error: error.message || 'Failed to delete entry' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: NODE_ENV });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  // Updated log messages
  console.log(`Users data file: ${USERS_FILE}`);
  console.log(`Entries data file: ${DATA_FILE}`);
});