import clientPromise from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const client = await clientPromise;
    const db = client.db('aqi_monitoring');

    if (req.method === 'GET') {
      // Get latest predictions for the sensor
      const latestPrediction = await db.collection('predictions')
        .findOne(
          { sensor_id: id },
          { sort: { generated_at: -1 } }
        );

      if (!latestPrediction) {
        // Try to generate new predictions by calling AirPhyNet service
        try {
          const airphynetUrl = process.env.AIRPHYNET_API_URL;
          if (!airphynetUrl) throw new Error("AIRPHYNET_API_URL is not set");
          const response = await fetch(`${airphynetUrl}/predict`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.API_SECRET_KEY,
            },
            body: JSON.stringify({
              sensor_id: id,
              hours_ahead: 6
            })
          });

          if (response.ok) {
            const predictionData = await response.json();
            return res.status(200).json(predictionData);
          }
        } catch (error) {
          console.error('Error calling AirPhyNet service:', error);
        }

        return res.status(404).json({ error: 'No predictions available' });
      }

      res.status(200).json(latestPrediction);
    } else if (req.method === 'POST') {
      // Trigger new prediction
      try {
        const airphynetUrl = process.env.AIRPHYNET_API_URL;
        if (!airphynetUrl) throw new Error("AIRPHYNET_API_URL is not set");
        const response = await fetch(`${airphynetUrl}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sensor_id: id,
            hours_ahead: req.body.hours_ahead || 6
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate predictions');
        }

        const predictionData = await response.json();
        res.status(200).json(predictionData);
      } catch (error) {
        console.error('Error generating predictions:', error);
        res.status(500).json({ error: 'Failed to generate predictions' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}