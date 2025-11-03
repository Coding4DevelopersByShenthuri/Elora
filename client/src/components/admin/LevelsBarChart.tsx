import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type LevelsData = Record<string, number> | Array<{ level: string; count: number }>;

interface LevelsBarChartProps {
  data: LevelsData;
}

function normalize(data: LevelsData): Array<{ label: string; value: number }> {
  if (Array.isArray(data)) {
    return data.map(d => ({ 
      label: String((d as any).level || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
      value: Number((d as any).count || 0) 
    }));
  }
  return Object.entries(data)
    .filter(([_, v]) => Number(v || 0) > 0) // Filter out zero values
    .map(([k, v]) => ({ 
      label: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
      value: Number(v || 0) 
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending
}

export function LevelsBarChart({ data }: LevelsBarChartProps) {
  const rows = normalize(data);

  if (!rows.length) {
    return (
      <div className="h-[260px] flex items-center justify-center text-muted-foreground">No data</div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" interval={0} angle={-30} textAnchor="end" height={70} fontSize={12} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default LevelsBarChart;


