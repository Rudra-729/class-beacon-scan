import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useSEO } from "@/hooks/use-seo";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, profile } = useAuth();
  
  useSEO({
    title: "Attendify - Smart Attendance System",
    description: "Face recognition + BLE proximity based college attendance system.",
  });

  return (
    <Layout>
      <section className="mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Attendify</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Smart attendance system with face recognition and BLE proximity detection.
        </p>
        
        {user && profile ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Welcome, {profile.full_name}!</CardTitle>
                <CardDescription>
                  Role: {profile.role} • Department: {profile.department}
                  {profile.role === 'student' && profile.student_id && (
                    <><br />Student ID: {profile.student_id}</>
                  )}
                  {profile.role === 'professor' && profile.staff_id && (
                    <><br />Staff ID: {profile.staff_id}</>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
            
            {profile.role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Check-in</CardTitle>
                  <CardDescription>Record your attendance using face and BLE verification.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link to="/student">Start Check-in</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {profile.role === 'professor' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Control</CardTitle>
                    <CardDescription>Manage attendance windows and sessions.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link to="/admin">Admin Panel</Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>View Records</CardTitle>
                    <CardDescription>View and manage attendance records by subject.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="secondary" asChild>
                      <Link to="/attendance">View Records</Link>
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>For Students</CardTitle>
                <CardDescription>Quick and secure attendance check-in using face recognition and proximity detection.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link to="/auth">Student Login</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>For Professors</CardTitle>
                <CardDescription>Manage attendance sessions and view comprehensive attendance reports.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" asChild>
                  <Link to="/auth">Professor Login</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;