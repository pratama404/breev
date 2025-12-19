// MongoDB initialization script
db = db.getSiblingDB('aqi_monitoring');

// Create collections
db.createCollection('sensor_logs');
db.createCollection('devices');
db.createCollection('predictions');
db.createCollection('users');

// Create indexes for better performance
db.sensor_logs.createIndex({ "sensor_id": 1, "timestamp": -1 });
db.sensor_logs.createIndex({ "timestamp": -1 });
db.devices.createIndex({ "sensor_id": 1 }, { unique: true });
db.predictions.createIndex({ "sensor_id": 1, "generated_at": -1 });

// Insert sample device data
db.devices.insertMany([
    {
        sensor_id: "ESP32_A101",
        name: "Meeting Room 1",
        location: "Floor 1, Room 101",
        qr_code: "https://aqi-app.vercel.app/room/meeting-room-1",
        installed_date: new Date(),
        status: "active"
    },
    {
        sensor_id: "ESP32_A102",
        name: "Office Space",
        location: "Floor 2, Open Area",
        qr_code: "https://aqi-app.vercel.app/room/office-space",
        installed_date: new Date(),
        status: "active"
    }
]);

// Insert admin user
db.users.insertOne({
    username: "admin",
    password: "$2b$10$rOzJmZKz8qHqV8qGqGqGqOzJmZKz8qHqV8qGqGqGqOzJmZKz8qHqV8", // hashed "admin123"
    role: "admin",
    created_at: new Date()
});

print("Database initialized successfully!");