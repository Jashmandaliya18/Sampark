import mongooe from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongooe.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
};