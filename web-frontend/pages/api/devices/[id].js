import clientPromise from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const client = await clientPromise;
    const db = client.db('aqi_monitoring');

    if (req.method === 'DELETE') {
      // Delete device
      const result = await db.collection('devices').deleteOne({ sensor_id: id });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Device not found' });
      }

      res.status(200).json({ message: 'Device deleted successfully' });
    } else if (req.method === 'PUT') {
      // Update device
      const { name, location, status } = req.body;
      
      const updateData = {};
      if (name) updateData.name = name;
      if (location) updateData.location = location;
      if (status) updateData.status = status;

      const result = await db.collection('devices').updateOne(
        { sensor_id: id },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Device not found' });
      }

      res.status(200).json({ message: 'Device updated successfully' });
    } else {
      res.setHeader('Allow', ['DELETE', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}