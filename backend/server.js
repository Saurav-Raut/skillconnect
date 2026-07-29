const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to Database
const connectDB = require('./config/db');
connectDB();

// Policy Cleanup Schedule
const { cleanExpiredFaceData } = require('./utils/faceDataPolicy');
// Run on startup
cleanExpiredFaceData();
// Run every hour to keep database clean
setInterval(cleanExpiredFaceData, 60 * 60 * 1000);

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const householdRoutes = require('./routes/householdRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const appealRoutes = require('./routes/appealRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Route Mappings
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/appeals', appealRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler Middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Initialize Sockets
const socketHandler = require('./sockets/locationSocket');
socketHandler(io);

// Server port mapping
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SkillConnect backend listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
