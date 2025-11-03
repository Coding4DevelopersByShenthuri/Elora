import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAchievements() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground">Manage achievement catalog</p>
        </div>
        <Card className="soft-card">
          <CardHeader>
            <CardTitle>Achievements Manager</CardTitle>
            <CardDescription>Coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">CRUD and stats will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}


