import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrendGraph({ data, predictions = [] }) {
  // Combine historical and prediction data
  const combinedData = [
    ...data.map(item => ({
      ...item,
      time: new Date(item.timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'historical'
    })),
    ...predictions.map(pred => ({
      // We map predicted CO2 to aqi_calculated just for shared Y-axis (or we should use separate axis)
      // Since CO2 is ppm (400-2000), let's keep it in the same object but maybe Graph needs update?
      // Actually, TrendGraph plots 'aqi_calculated'.
      // If we want to verify CO2 prediction against Historical CO2, we should plot CO2.
      // But TrendGraph is labeled 'AQI Trends'.
      // Let's modify TrendGraph to be generic or plot CO2 if predictions exist.
      // For now, let's map it to 'aqi_calculated' so it shows up, BUT this is technically wrong scale.
      // Better fix: Map 'co2_ppm' for historical and 'predicted_co2' for prediction.
      value: pred.predicted_co2,
      time: new Date(pred.predicted_time).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'prediction'
    }))
  ];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value, name) => [
              Math.round(value),
              name === 'aqi_calculated' ? 'AQI' : name
            ]}
            labelFormatter={(label) => `Waktu: ${label}`}
          />
          <Legend />

          {/* Historical data line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            connectNulls={false}
            name="Data Historis"
          />

          {/* Prediction line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
            connectNulls={false}
            name="Prediksi"
            data={predictions.map(pred => ({
              value: pred.predicted_co2,
              time: new Date(pred.predicted_time).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })
            }))}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}