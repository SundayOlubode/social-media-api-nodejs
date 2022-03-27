import mongoose from 'mongoose';

const databse = {
    connect: async (mongoUri, dbName) => {
        try {
            await mongoose.connect(mongoUri, { dbName: dbName });
            console.log(`[database] connected successfully to MongoDB`);
        }
        catch (err) {
            console.log(`[database] could not connect due to [${err.message}]`);
        }
    }
}


export default databse;