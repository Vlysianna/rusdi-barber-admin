import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Card from '../../../shared/components/Card';
import { CHART_COLORS } from '../../../config/constants';

interface RevenueChartProps {
  data: Array<{ date: string; amount: number }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pendapatan</h3>
        <p className="text-sm text-gray-500">Trend pendapatan 30 hari terakhir</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `Rp ${(value / 1000)}K`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke={CHART_COLORS.primary}
            fill={CHART_COLORS.primary}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

interface BookingsChartProps {
  data: Array<{ status: string; count: number }>;
}

export const BookingsStatusChart: React.FC<BookingsChartProps> = ({ data }) => {
  const COLORS = {
    pending: CHART_COLORS.warning,
    confirmed: CHART_COLORS.primary,
    in_progress: CHART_COLORS.secondary,
    completed: CHART_COLORS.success,
    cancelled: CHART_COLORS.danger,
    no_show: CHART_COLORS.gray,
  };

  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    in_progress: 'Sedang Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    no_show: 'Tidak Hadir',
  };

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Status Booking</h3>
        <p className="text-sm text-gray-500">Distribusi status booking</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ status, percent }) => `${statusLabels[status]} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || CHART_COLORS.gray} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [value, statusLabels[name] || name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

interface TopServicesChartProps {
  data: Array<{ name: string; bookings: number; revenue: number }>;
}

export const TopServicesChart: React.FC<TopServicesChartProps> = ({ data }) => {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Layanan Terpopuler</h3>
        <p className="text-sm text-gray-500">Top 5 layanan berdasarkan jumlah booking</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="#6B7280" 
            style={{ fontSize: '12px' }}
            width={100}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="bookings" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
