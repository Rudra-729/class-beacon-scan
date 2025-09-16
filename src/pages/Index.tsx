import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  useSEO({
    title: "Attendance Prototype Home",
    description: "Prototype for face recognition + BLE-based college attendance.",
  });

  return (
    <Layout>
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Attendance Prototype</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Face recognition + BLE proximity with admin-controlled time windows (frontend demo).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Student</CardTitle>
              <CardDescription>Check in using camera + BLE simulation.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/student">Go to Student</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
              <CardDescription>Open/close timed attendance windows.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" asChild>
                <Link to="/admin">Go to Admin</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

