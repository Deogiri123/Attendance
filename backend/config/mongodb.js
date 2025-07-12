import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Check if already connected
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB already connected!');
            return;
        }

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected!')
        })

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        })

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected!')
        })

        await mongoose.connect(`${process.env.MONGODB_URI}/classes`, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        throw error;
    }
}

export default connectDB;