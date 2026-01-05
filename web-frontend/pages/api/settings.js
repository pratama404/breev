import clientPromise from '../../lib/db';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db('aqi_monitoring');
        const collection = db.collection('system_settings');

        if (req.method === 'GET') {
            const settings = await collection.findOne({ type: 'global' });

            // Default Settings
            const defaults = {
                aqi_threshold: { moderate: 100, unhealthy: 150 },
                mqtt: { broker_url: 'mqtt://broker.hivemq.com', topic: 'breev/data', qos: 1 },
                notification: { enabled: true, channel: ['dashboard'] }
            };

            res.status(200).json(settings?.config || defaults);

        } else if (req.method === 'POST') {
            const newConfig = req.body;

            await collection.updateOne(
                { type: 'global' },
                { $set: { config: newConfig, updated_at: new Date() } },
                { upsert: true }
            );

            res.status(200).json({ message: 'Settings saved successfully' });

        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Settings API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
