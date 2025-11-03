import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminVocabulary() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vocabulary</h1>
          <p className="text-muted-foreground">Aggregated vocabulary performance</p>
        </div>
        <Card className="soft-card">
          <CardHeader>
            <CardTitle>Vocabulary Insights</CardTitle>
            <CardDescription>Coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Filters and exports will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}


