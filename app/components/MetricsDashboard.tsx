'use client';
import { FC } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define the RepairOrder interface (you may also import this from a shared types file)
export interface RepairOrderType {
  id: string;
  year: string;
  make: string;
  model: string;
  roNumber: string;
  labor: number;
  createdAt: string;
}

interface MetricsDashboardProps {
  orders: RepairOrderType[];
  dailyTarget: number;
  weeklyTarget: number;
}

const MetricsDashboard: FC<MetricsDashboardProps> = ({
  orders,
  dailyTarget,
  weeklyTarget,
}) => {
  // Compute metrics for day, week, and month
  let laborDay = 0,
    laborWeek = 0,
    laborMonth = 0;
  let countDay = 0,
    countWeek = 0,
    countMonth = 0;

  const currentDate = new Date();
  const todayStr = currentDate.toISOString().split('T')[0];
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Compute start and end of week (assuming week starts on Monday)
  const dayOfWeek = currentDate.getDay(); // 0 (Sun) to 6 (Sat)
  const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // treat Sunday as 7
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - adjustedDay + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const orderDayStr = orderDate.toISOString().split('T')[0];
    if (orderDayStr === todayStr) {
      laborDay += order.labor;
      countDay++;
    }
    if (orderDate >= startOfWeek && orderDate <= endOfWeek) {
      laborWeek += order.labor;
      countWeek++;
    }
    if (
      orderDate.getMonth() === currentMonth &&
      orderDate.getFullYear() === currentYear
    ) {
      laborMonth += order.labor;
      countMonth++;
    }
  });

  const efficiencyDay = dailyTarget ? (laborDay / dailyTarget) * 100 : 0;
  const efficiencyWeek = weeklyTarget ? (laborWeek / weeklyTarget) * 100 : 0;
  // For month, assume 30 days as an approximation
  const efficiencyMonth = dailyTarget
    ? (laborMonth / (dailyTarget * 30)) * 100
    : 0;

  const chartData = {
    labels: ['Day', 'Week', 'Month'],
    datasets: [
      {
        label: 'Efficiency (%)',
        data: [efficiencyDay, efficiencyWeek, efficiencyMonth],
        backgroundColor: ['#3B82F6', '#3B82F6', '#3B82F6'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Labor Efficiency' },
    },
  };

  return (
    <div className='max-w-md mx-auto mb-6'>
      <Bar data={chartData} options={chartOptions} />
      <div className='text-center mt-4'>
        <p>
          <strong>Repair Orders Today:</strong> {countDay}
        </p>
        <p>
          <strong>Repair Orders This Week:</strong> {countWeek}
        </p>
        <p>
          <strong>Repair Orders This Month:</strong> {countMonth}
        </p>
      </div>
    </div>
  );
};

export default MetricsDashboard;
