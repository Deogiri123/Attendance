import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoute.js';
import studentRouter from './routes/studentRoute.js';
import subjectRouter from './routes/subjectRoute.js';
import teacherRouter from './routes/teacherRoute.js';
import attendanceRouter from './routes/attendanceRoute.js';
import whatsappRouter from './routes/whatsappRoute.js';

// Import WhatsApp bot to initialize it with the server
// import './whatsapp-bot.js';
// import './whatsapp-bot-mac.js';
import './whatsapp-bot-working.js';

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB with better error handling
let isConnected = false;

const initializeDB = async () => {
  try {
    await connectDB();
    isConnected = true;
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    isConnected = false;
  }
};

// Initialize database connection
initializeDB();

// Middlewares
app.use(express.json());

// CORS Configuration - Updated for production
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://127.0.0.1:5173',
        'https://your-frontend-domain.vercel.app', // Replace with your actual frontend domain
        'https://your-backend-domain.vercel.app'   // Replace with your actual backend domain
    ],
    credentials: true
}));

// Database connection check middleware
app.use((req, res, next) => {
  if (!isConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available. Please try again later.'
    });
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

//api endpoint
app.use('/api/user', userRouter)
app.use('/api/student', studentRouter)
app.use('/api/subject', subjectRouter)
app.use('/api/teacher', teacherRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/whatsapp', whatsappRouter)

app.get('/', (req, res) =>{
    res.send("API Working")
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    database: isConnected ? 'connected' : 'disconnected'
  });
});

app.listen(port, () => {
    console.log(`Server started on PORT: ${port}`)
})
