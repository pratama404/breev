import clientPromise from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const client = await clientPromise;
    const db = client.db('aqi_monitoring');

    if (req.method === 'GET') {
      // Get current and historical sensor data
      const currentData = await db.collection('sensor_logs')
        .findOne(
          { sensor_id: id },
          { sort: { timestamp: -1 } }
        );

      if (!currentData) {
        return res.status(404).json({ error: 'No data found for this sensor' });
      }

      // Fetch Device Metadata (Name, Location)
      const deviceMeta = await db.collection('devices').findOne({ sensor_id: id });

      // Merge metadata into current data for frontend convenience
      if (deviceMeta) {
        currentData.name = deviceMeta.name;
        currentData.location = deviceMeta.location;
      }

      if (!currentData) {
        return res.status(404).json({ error: 'No data found for this sensor' });
      }

      // Get historical data (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const historicalData = await db.collection('sensor_logs')
        .find({
          sensor_id: id,
          timestamp: { $gte: twentyFourHoursAgo }
        })
        .sort({ timestamp: 1 })
        .limit(100)
        .toArray();

      res.status(200).json({
        current: currentData,
        historical: historicalData
      });
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}