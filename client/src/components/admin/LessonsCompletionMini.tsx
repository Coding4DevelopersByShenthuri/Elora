import { ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

interface LessonsCompletionMiniProps {
  completionRate: number; // 0-100
  completedLast7?: number;
  completedLast30?: number;
}

export function LessonsCompletionMini({ completionRate, completedLast7 = 0, completedLast30 = 0 }: LessonsCompletionMiniProps) {
  const safeRate = Math.max(0, Math.min(100, Number(isNaN(completionRate) ? 0 : completionRate)));
  const data = [{ name: 'Completion', value: safeRate, fill: 'hsl(var(--primary))' }];

  return (
    <div className="grid gap-3">
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={8} />
            <Legend content={() => (
              <div className="text-center">
                <div className="text-2xl font-semibold">{safeRate}%</div>
                <div className="text-xs text-muted-foreground">Completion Rate</div>
              </div>
            )} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md border p-2">
          <div className="text-muted-foreground">Completed (7d)</div>
          <div className="font-medium">{completedLast7}</div>
        </div>
        <div className="rounded-md border p-2">
          <div className="text-muted-foreground">Completed (30d)</div>
          <div className="font-medium">{completedLast30}</div>
        </div>
      </div>
    </div>
  );
}

export default LessonsCompletionMini;


