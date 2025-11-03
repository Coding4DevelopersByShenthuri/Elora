import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminProgress() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
          <p className="text-muted-foreground">Cross-user lesson progress</p>
        </div>
        <Card className="soft-card">
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
            <CardDescription>Coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Charts and tables will show progress here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}


