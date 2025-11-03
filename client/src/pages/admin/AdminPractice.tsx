import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPractice() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
          <p className="text-muted-foreground">Browse and analyze practice sessions</p>
        </div>
        <Card className="soft-card">
          <CardHeader>
            <CardTitle>Practice Explorer</CardTitle>
            <CardDescription>Coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Filters and tables will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}


