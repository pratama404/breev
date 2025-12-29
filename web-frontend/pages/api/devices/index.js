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
              { $project: { timestamp: 1, battery: 1 } } // Assuming battery is in logs, or remove if not
            ],
            as: "last_log"
          }
        },
        {
          $addFields: {
            last_seen: { $arrayElemAt: ["$last_log.timestamp", 0] },
            battery_level: { $ifNull: [{ $arrayElemAt: ["$last_log.battery", 0] }, 100] }
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

      const newDevice = {
        sensor_id,
        name,
        location,
        qr_code: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/room/${sensor_id}`,
        installed_date: new Date(),
        status: 'active'
      };

      const result = await db.collection('devices').insertOne(newDevice);
      res.status(201).json({ ...newDevice, _id: result.insertedId });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}