import mongoose from "mongoose";

interface ConnectionState {
  isConnected?: number;
}

const connection: ConnectionState = {};

export async function connectToDatabase(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;
    if (connection.isConnected === 1) {
      console.log("Using existing database connection");
      return;
    }
    await mongoose.disconnect();
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      dbName: process.env.DB_NAME || "next-auth-based",
      bufferCommands: false,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === "production") {
      await mongoose.disconnect();
      connection.isConnected = 0;
      console.log("Disconnected from MongoDB");
    } else {
      console.log("Keeping MongoDB connection in development");
    }
  }
}
