import mongoose from 'mongoose';

const connectMongose = async () => {
    try {
        await mongoose.connect(process.env.MONOGO_DB_STRING, {
        
        });
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

export default connectMongose;