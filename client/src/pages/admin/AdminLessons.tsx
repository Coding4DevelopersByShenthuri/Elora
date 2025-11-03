import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLessons() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
          <p className="text-muted-foreground">Create, edit, and manage lessons</p>
        </div>
        <Card className="soft-card">
          <CardHeader>
            <CardTitle>Lessons Manager</CardTitle>
            <CardDescription>Coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This page will let you manage lessons and content types.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}


