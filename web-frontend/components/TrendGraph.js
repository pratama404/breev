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
      aqi_calculated: pred.predicted_aqi,
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
            domain={[0, 200]}
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
            dataKey="aqi_calculated"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            connectNulls={false}
            name="Data Historis"
          />
          
          {/* Prediction line */}
          <Line
            type="monotone"
            dataKey="aqi_calculated"
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
            connectNulls={false}
            name="Prediksi"
            data={predictions.map(pred => ({
              aqi_calculated: pred.predicted_aqi,
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