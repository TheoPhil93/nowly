// src/utils/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nowly';

if (!MONGODB_URI) {
    throw new Error('Bitte definiere die MONGODB_URI Umgebungsvariable');
}

// Alternative approach with interface merging
interface GlobalWithMongoose {
    mongoose?: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

// Add mongoose to the global type
declare const global: GlobalWithMongoose;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached?.conn) {
        return cached.conn;
    }

    if (!cached?.promise) {
        cached!.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached!.conn = await cached!.promise;
    } catch (e) {
        cached!.promise = null;
        throw e;
    }

    return cached!.conn;
}

export default connectDB;