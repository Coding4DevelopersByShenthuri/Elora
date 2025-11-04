import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LessonStatsChartsProps {
  stats: {
    by_type?: Record<string, any>;
    by_content?: Record<string, any>;
    difficulty_distribution?: Record<number, number>;
    top_lessons?: Array<{ id: number; title: string; lesson_type: string; completions: number }>;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const LESSON_TYPE_LABELS: Record<string, string> = {
  'kids_4_10': 'Kids (4-10)',
  'kids_11_17': 'Kids (11-17)',
  'beginner': 'Adults - Beginner',
  'intermediate': 'Adults - Intermediate',
  'advanced': 'Adults - Advanced',
  'ielts': 'IELTS',
  'pte': 'PTE',
};

export function LessonTypeDistributionChart({ stats }: LessonStatsChartsProps) {
  if (!stats?.by_type) return null;

  const data = Object.entries(stats.by_type)
    .map(([key, value]) => ({
      name: LESSON_TYPE_LABELS[key] || key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      total: value.total || 0,
      active: value.active || 0,
      inactive: value.inactive || 0,
    }))
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>No lesson data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={80} 
          fontSize={11}
          tick={{ fill: '#6b7280' }}
        />
        <YAxis tick={{ fill: '#6b7280' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px'
          }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar dataKey="active" fill="#10b981" name="Active" radius={[4, 4, 0, 0]} />
        <Bar dataKey="inactive" fill="#ef4444" name="Inactive" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ContentTypeDistributionChart({ stats }: LessonStatsChartsProps) {
  if (!stats?.by_content) return null;

  const data = Object.entries(stats.by_content)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value.total || 0,
      completed: value.completed || 0,
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>No content type data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => {
            const { name, percent } = props;
            return `${name} ${((percent as number) * 100).toFixed(0)}%`;
          }}
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px'
          }}
          formatter={(value: number, name: string) => [
            `${value} lessons`,
            name === 'value' ? 'Total' : name
          ]}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DifficultyDistributionChart({ stats }: LessonStatsChartsProps) {
  if (!stats?.difficulty_distribution) return null;

  const data = Object.entries(stats.difficulty_distribution)
    .map(([level, count]) => ({
      level: parseInt(level),
      count: count as number,
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => a.level - b.level);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>No difficulty data available</p>
      </div>
    );
  }

  // Calculate average difficulty
  const totalLessons = data.reduce((sum, item) => sum + item.count, 0);
  const weightedSum = data.reduce((sum, item) => sum + (item.level * item.count), 0);
  const avgDifficulty = totalLessons > 0 ? (weightedSum / totalLessons).toFixed(1) : '0';

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="text-sm text-muted-foreground">Average Difficulty</p>
        <p className="text-2xl font-bold">{avgDifficulty}/10</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="level" 
            label={{ value: 'Difficulty Level', position: 'insideBottom', offset: -5 }}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            label={{ value: 'Number of Lessons', angle: -90, position: 'insideLeft' }}
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px'
            }}
            formatter={(value: number) => [`${value} lessons`, 'Count']}
          />
          <Bar 
            dataKey="count" 
            fill="#3b82f6" 
            name="Lessons" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

