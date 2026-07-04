import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { AnalyticsData } from '../types';

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#818CF8', '#EC4899'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Query Volume & Escalation Trends */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Query Volume & Escalation Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.query_trends}>
              <defs>
                <linearGradient id="queryColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="queries" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#queryColor)" name="Total Queries" />
              <Area type="monotone" dataKey="escalations" stroke="#F43F5E" strokeWidth={2} fillOpacity={0} name="Human Escalations" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Document Category Distribution</h3>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.category_breakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="count"
                nameKey="category"
              >
                {data.category_breakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Performance & Latency */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4 lg:col-span-2">
        <h3 className="text-sm font-bold text-white tracking-tight">LangGraph Agent Execution Latency (ms)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.agent_performance}>
              <XAxis dataKey="agent_name" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="avg_time_ms" fill="#818CF8" radius={[8, 8, 0, 0]} name="Avg Latency (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
