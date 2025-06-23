// MongoDB initialization script for Docker
db = db.getSiblingDB("next-auth-boilerplate");

// Create collections
db.createCollection("users");
db.createCollection("roles");
db.createCollection("permissions");
db.createCollection("sessions");

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "profile.username": 1 }, { unique: true, sparse: true });
db.sessions.createIndex({ sessionId: 1 }, { unique: true });
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print("Database initialized successfully!");
