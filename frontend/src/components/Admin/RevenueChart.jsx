import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';


const RevenueChart = ({ title, labels = [], values = [], height = '300px' }) => {
  // Log props to help debug
  console.log('RevenueChart props:', { title, labels, values, height });
  
  // Create safe versions of the data
  const safeLabels = Array.isArray(labels) ? labels : [];
  const safeValues = Array.isArray(values) ? values : [];
  
  // Convert the labels and values into the format Recharts expects
  const data = [];
  for (let i = 0; i < safeLabels.length && i < safeValues.length; i++) {
    data.push({
      name: safeLabels[i],
      revenue: safeValues[i]
    });
  }
  
  console.log('Recharts data:', data);
  
  // Show error messages for invalid data
  if (!labels || !values) {
    console.error('Missing chart data:', { labels, values });
    return <div className="p-4 bg-red-100 text-red-800 rounded">Chart data is missing</div>;
  }
  
  if (!Array.isArray(labels) || !Array.isArray(values)) {
    console.error('Invalid chart data format:', { labels, values });
    return <div className="p-4 bg-red-100 text-red-800 rounded">Chart data format is invalid</div>;
  }
  
  if (data.length === 0) {
    console.error('Empty chart data arrays:', { labels, values });
    return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">No data available for chart</div>;
  }
  // Format the currency
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div>
      {title && <h3 className="text-center mb-4">{title}</h3>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip 
              formatter={(value) => [`${formatCurrency(value)}`, 'Revenue']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey="revenue" 
              name="Revenue" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
