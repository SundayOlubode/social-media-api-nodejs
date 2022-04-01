import mongoose from 'mongoose';

const databse = {
    connect: async (mongoUri, dbName) => {
        try {
            await mongoose.connect(mongoUri, {
                dbName: dbName,
                autoIndex: true,
                socketTimeoutMS: 45000,
                serverSelectionTimeoutMS: 60000,
            });
            console.log(`[database] connected successfully to MongoDB`);
        }
        catch (err) {
            console.log(`[database] could not connect due to [${err.message}]`);
        }
    }
}


export default databse;