## Frontend - Chat Application

### Overview
The frontend of this chat application is built using **React** with **TypeScript** for type safety. It leverages **Tailwind CSS** for styling and has a responsive, intuitive UI. The primary focus is to provide a seamless and secure messaging experience for users.

### Key Features
- Real-time messaging with WebSockets.
- Audio recording with waveform visualization.
- File sharing with encryption before upload.
- User authentication with JWT tokens.
- MongoDB Atlas Search for efficient user search.
- Message reactions and read receipts.
- Responsive design with Tailwind CSS.

### Tech Stack
- **React** with **TypeScript**
- **Redux Toolkit** (for non-chat state management)
- **Tailwind CSS**
- **WebSockets** for real-time communication
- **CryptoJS** for encryption

### Getting Started

#### Installation
1. Navigate to the frontend directory:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```

#### Running the Application
```bash
npm start
```
Frontend will be available at `http://localhost:3000`

### Environment Variables
Create a `.env` file in the root directory with the following:
```
REACT_APP_BACKEND_URL=<Your Backend URL>
REACT_APP_SOCKET_URL=<WebSocket URL>
```

### Folder Structure
- `src/components`: Reusable UI components.
- `src/pages`: Main application pages.
- `src/context`: Context API for chat state management.
- `src/utils`: Utility functions like encryption and decryption.
