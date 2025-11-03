import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSurveys() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surveys</h1>
          <p className="text-muted-foreground">Insights from user surveys</p>
        </div>
        <Card className="soft-card">
          <CardHeader>
            <CardTitle>Survey Insights</CardTitle>
            <CardDescription>Coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Distribution charts will be shown here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}


