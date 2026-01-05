import clientPromise from '../../../lib/db';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('aqi_monitoring');

    if (req.method === 'GET') {
      // Get all devices with last seen status
      const devices = await db.collection('devices').aggregate([
        {
          $lookup: {
            from: "sensor_logs",
            localField: "sensor_id",
            foreignField: "sensor_id",
            pipeline: [
              { $sort: { timestamp: -1 } },
              { $limit: 1 },
              { $project: { timestamp: 1, battery: 1, aqi_calculated: 1 } }
            ],
            as: "last_log"
          }
        },
        {
          $addFields: {
            last_seen: { $arrayElemAt: ["$last_log.timestamp", 0] },
            battery_level: { $ifNull: [{ $arrayElemAt: ["$last_log.battery", 0] }, 100] },
            latest_aqi: { $ifNull: [{ $arrayElemAt: ["$last_log.aqi_calculated", 0] }, 0] }
          }
        },
        { $project: { last_log: 0 } }
      ]).toArray();

      res.status(200).json(devices);
    } else if (req.method === 'POST') {
      // Add new device
      const { sensor_id, name, location } = req.body;

      if (!sensor_id || !name || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if device already exists
      const existingDevice = await db.collection('devices').findOne({ sensor_id });
      if (existingDevice) {
        return res.status(409).json({ error: 'Device with this Sensor ID already exists' });
      }

      const newDevice = {
        sensor_id,
        name,
        location,
        qr_code: `${process.env.NEXTAUTH_URL || `https://${req.headers.host}`}/room/${sensor_id}`,
        installed_date: new Date(),
        status: 'active'
      };

      const result = await db.collection('devices').insertOne(newDevice);
      res.status(201).json({ ...newDevice, _id: result.insertedId });
    } else if (req.method === 'DELETE') {
      // Delete device
      const { sensor_id } = req.query;

      if (!sensor_id) {
        return res.status(400).json({ error: 'Missing sensor_id' });
      }

      const result = await db.collection('devices').deleteOne({ sensor_id });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: 'Device deleted successfully' });
      } else {
        res.status(404).json({ error: 'Device not found' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}