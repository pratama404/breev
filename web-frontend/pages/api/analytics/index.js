import clientPromise from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const client = await clientPromise;
        const db = client.db('aqi_monitoring');

        // 1. Calculate Summary Stats
        // Get all active devices (seen in last 10 minutes)
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        // We need to query logs to see which sensors sent data recently
        // Or better, aggregate logs to find distinct sensors in last X time
        const activeSensors = await db.collection('sensor_logs').distinct('sensor_id', {
            timestamp: { $gte: tenMinsAgo }
        });

        // AQI Stats (from last 24h logs)
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const aqiStats = await db.collection('sensor_logs').aggregate([
            { $match: { timestamp: { $gte: dayAgo } } },
            {
                $group: {
                    _id: null,
                    avg_aqi: { $avg: "$aqi_calculated" },
                    max_aqi: { $max: "$aqi_calculated" },
                    min_aqi: { $min: "$aqi_calculated" }
                }
            }
        ]).toArray();

        const stats = aqiStats[0] || { avg_aqi: 0, max_aqi: 0, min_aqi: 0 };

        // 2. Trend Data (AQI & CO2 over time - e.g. hourly avg for last 24h)
        const trends = await db.collection('sensor_logs').aggregate([
            { $match: { timestamp: { $gte: dayAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%dT%H:00:00", date: "$timestamp" } }, // Group by Hour
                    aqi: { $avg: "$aqi_calculated" },
                    co2: { $avg: "$co2_ppm" }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    time: "$_id",
                    aqi: { $round: ["$aqi", 0] },
                    co2: { $round: ["$co2", 0] },
                    _id: 0
                }
            }
        ]).toArray();

        // Ensure strictly sorted and fill gaps if we wanted perfection, but this is fine for MVP

        // --- NEW: Insight Calculation (Compare Last 24h vs Previous 24h) ---
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const prevStats = await db.collection('sensor_logs').aggregate([
            { $match: { timestamp: { $gte: twoDaysAgo, $lt: dayAgo } } },
            { $group: { _id: null, avg_aqi: { $avg: "$aqi_calculated" } } }
        ]).toArray();

        const prevAvg = prevStats[0]?.avg_aqi || 0;
        const currAvg = stats.avg_aqi || 0;
        let diffPercent = 0;
        if (prevAvg > 0) {
            diffPercent = ((currAvg - prevAvg) / prevAvg) * 100;
        }

        const insight = {
            message: diffPercent === 0
                ? "Air quality is stable compared to yesterday."
                : `Average AQI has ${diffPercent < 0 ? 'improved' : 'worsened'} by ${Math.abs(Math.round(diffPercent))}% since yesterday.`,
            trend: diffPercent <= 0 ? 'good' : 'bad'
        };

        // 3. Sensor Data (Latest detailed logs for charts, e.g. last 12 points)
        // For simplicity, let's just dump the last 20 logs overall (or filtered by device if query param exists)
        // If query sensor_id is present, filter by it
        const { sensor_id } = req.query;
        const matchQuery = sensor_id && sensor_id !== 'all' ? { sensor_id } : {};

        const sensorLogs = await db.collection('sensor_logs')
            .find(matchQuery)
            .sort({ timestamp: -1 })
            .limit(20)
            .toArray();

        // Convert to chart friendly format
        const sensorData = sensorLogs.map(log => ({
            time: log.timestamp,
            gas_ppm: log.co2_ppm, // Assuming map gas to co2 for now or generic gas
            temperature: log.temperature,
            humidity: log.humidity
        })).reverse(); // Oldest first for charts

        res.status(200).json({
            summary: {
                avg_aqi: Math.round(stats.avg_aqi),
                max_aqi: stats.max_aqi,
                min_aqi: stats.min_aqi,
                active_devices: activeSensors.length
            },
            aqi_trend: trends,
            sensor_data: sensorData,
            insight: insight
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
