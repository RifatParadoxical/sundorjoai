const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sundorjo';
        

        
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000, 
        });

        console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error('✗ MongoDB connection error:', error.message);
        console.error('\n⚠️  Please ensure MongoDB is running or set MONGODB_URI in your .env file');
        console.error('   For local MongoDB: sudo systemctl start mongod');
        console.error('   For MongoDB Atlas: Set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sundorjo\n');
      
        


        return false;
    }
};




// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

module.exports = connectDB;

