# Voice Journal Web App

## Overview
Voice Journal is a web application that allows users to record voice notes, transcribe them automatically, and save them for later reference. The app features a modern, glassmorphism-inspired UI with responsive design for both desktop and mobile devices.

## Features
- Voice recording with real-time transcription using the Web Speech API
- Edit, save, and delete journal entries
- Mobile-responsive design with glassmorphism UI effects
- Offline capability with manual text entry
- Persistent storage of entries

## Technology Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: Express.js
- **APIs**: Web Speech Recognition API
- **Storage**: JSON file (could be upgraded to a database)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Start the backend server:
   ```
   node server.js
   ```

## Deployment

The app can be deployed to any static hosting service for the frontend, with the backend deployed to a Node.js hosting service.

### Frontend Deployment
1. Build the project:
   ```
   npm run build
   ```
2. Deploy the contents of the `dist` directory to your hosting service

### Backend Deployment
1. Deploy `server.js` to a Node.js hosting service
2. Update the `API_BASE_URL` in `App.jsx` to point to your deployed backend

## Browser Compatibility

The app works best in modern browsers that support the Web Speech API:
- Chrome (recommended)
- Edge
- Safari

## License
MIT
