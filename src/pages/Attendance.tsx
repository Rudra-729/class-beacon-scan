import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/use-seo";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AttendanceRecord {
  id: string;
  student_name: string;
  student_email: string | null;
  attendance_date: string;
  check_in_time: string;
  subjects: {
    name: string;
    code: string;
  };
}

export default function AttendancePage() {
  useSEO({
    title: "Attendance Records",
    description: "View student attendance records organized by subject.",
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchAttendanceRecords(selectedSubject);
    }
  }, [selectedSubject]);

  async function fetchSubjects() {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, code")
        .order("name");

      if (error) throw error;
      
      setSubjects(data || []);
      if (data && data.length > 0) {
        setSelectedSubject(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendanceRecords(subjectId: string) {
    try {
      const { data, error } = await supabase
        .from("attendance_records")
        .select(`
          id,
          student_name,
          student_email,
          attendance_date,
          check_in_time,
          subjects (
            name,
            code
          )
        `)
        .eq("subject_id", subjectId)
        .order("attendance_date", { ascending: false })
        .order("check_in_time", { ascending: false });

      if (error) throw error;
      
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  }

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-muted-foreground">Loading subjects...</div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['professor']}>
      <Layout>
      <article className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Attendance Records</h1>
          <p className="text-muted-foreground">View student attendance records organized by subject.</p>
        </header>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Subject</CardTitle>
              <CardDescription>Choose a subject to view its attendance records.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedSubjectData && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedSubjectData.name}</CardTitle>
                <CardDescription>
                  Course Code: {selectedSubjectData.code} • {attendanceRecords.length} attendance records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance records found for this subject.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Check-in Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.student_name}</TableCell>
                            <TableCell>{record.student_email || "—"}</TableCell>
                            <TableCell>
                              {format(new Date(record.attendance_date), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              {format(new Date(record.check_in_time), "HH:mm:ss")}
                            </TableCell>
                            <TableCell>
                              <Badge variant="default">Present</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </article>
    </Layout>
  </ProtectedRoute>
  );
}