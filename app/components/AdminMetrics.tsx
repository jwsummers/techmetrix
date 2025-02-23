'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';

interface TeamMetricsProps {
  metrics: {
    efficiency: number;
    countDay: number;
    countWeek: number;
    countMonth: number;
  };
}

export default function AdminMetrics({ metrics }: TeamMetricsProps) {
  // Chart Data for Repair Orders
  const chartData = [
    { name: 'Today', value: metrics.countDay },
    { name: 'This Week', value: metrics.countWeek },
    { name: 'This Month', value: metrics.countMonth },
  ];

  // Chart Data for Efficiency
  const efficiencyData = [{ name: 'Efficiency', value: metrics.efficiency }];

  return (
    <div className='mb-8 max-w-2xl mx-auto bg-surface p-6 rounded shadow'>
      <h2 className='text-2xl font-bold mb-4 text-center'>Team Metrics</h2>

      <div className='flex flex-col md:flex-row justify-center items-center gap-8'>
        {/* Efficiency Chart */}
        <div className='w-64 h-64 flex flex-col items-center'>
          <h3 className='text-lg font-semibold mb-2'>Efficiency</h3>
          <ResponsiveContainer width='100%' height={180}>
            <RadialBarChart
              innerRadius='80%'
              outerRadius='100%'
              data={efficiencyData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar background dataKey='value' fill='#FCA311' />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className='text-xl font-bold'>{metrics.efficiency.toFixed(1)}%</p>
        </div>

        {/* Repair Orders Bar Chart */}
        <div className='w-full md:w-96'>
          <h3 className='text-lg font-semibold mb-2 text-center'>
            Repair Orders
          </h3>
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey='name' stroke='#ccc' />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#222',
                  color: '#fff',
                  borderRadius: '5px',
                  border: '1px solid #444',
                }}
                cursor={{ fill: 'rgba(200, 200, 200, 0.2)' }}
              />
              <Bar dataKey='value' fill='#078b46' barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
