## Backend - Chat Application

### Overview
The backend of this chat application is built using **Node.js** and **Express**. It handles user authentication, message encryption, and file sharing with AWS S3. Uses **MongoDB** as the primary database, integrated with **Redis** for scaling and caching.

### Key Features
- Secure user authentication with JWT.
- End-to-end encryption for messages and files.
- Real-time messaging with WebSockets and Redis Pub/Sub.
- AWS S3 for secure file storage.
- MongoDB Atlas Search for user search.
- Scalable and optimized for large concurrent users.

### Tech Stack
- **Node.js** with **Express**
- **MongoDB** with Mongoose
- **Redis** for caching and Pub/Sub
- **AWS S3** for file storage
- **Multer** for file uploads
- **CryptoJS** and **TweetNaCl** for encryption

### Getting Started

#### Installation
1. Navigate to the backend directory:
```bash
cd backend
```
2. Install dependencies:
```bash
npm install
```

#### Running the Application
```bash
npm run dev
```
Backend will be available at `http://localhost:5000`

### Environment Variables
Create a `.env` file in the root directory with the following:
```
PORT=5000
MONGO_URI=<Your MongoDB URI>
REDIS_URL=<Your Redis URL>
AWS_ACCESS_KEY_ID=<Your AWS Access Key>
AWS_SECRET_ACCESS_KEY=<Your AWS Secret Key>
AWS_BUCKET_NAME=<Your S3 Bucket Name>
JWT_SECRET=<Your JWT Secret>
```

### Folder Structure
- `controllers/`: Request handlers for different routes.
- `models/`: Mongoose models for MongoDB.
- `routes/`: Express routes for authentication, messaging, and file uploads.
- `middleware/`: Middleware for authentication and file validation.
- `utils/`: Utility functions like encryption and decryption.

### Future Enhancements
- Dockerize the application for containerization.
- Implement advanced analytics and user insights.

