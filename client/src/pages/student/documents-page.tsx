import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FileText } from "lucide-react";
import { CreateDocumentRequestDialog } from "@/components/document-request/create-document-request-dialog";
import { Button } from "@/components/ui/button";

export default function StudentDocumentsPage() {
  const { user } = useAuth();

  interface StudentProfile {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    schoolId?: number;
  }

  const { data: student, isLoading: isLoadingStudent, error: studentError } = useQuery<StudentProfile>({
    queryKey: ["studentProfile"],
    queryFn: async () => {
      console.log('Fetching student profile from http://localhost:8080/api/profile');
      const response = await fetch('http://localhost:8080/api/profile', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch student profile');
      }
      const data = await response.json();
      console.log('Student profile response:', data);
      return data;
    },
    enabled: !!user && user.userType === "STUDENT",
  });

  useEffect(() => {
    console.log('Student data:', student);
    console.log('Student error:', studentError);
    if (studentError) {
      console.error('Student profile fetch error:', studentError.message);
    }
    if (student && !student.schoolId) {
      console.error('Student profile missing schoolId:', student);
    }
  }, [student, studentError]);

  if (isLoadingStudent) {
    return <DashboardLayout title="Loading...">Chargement...</DashboardLayout>;
  }

  if (studentError) {
    return (
      <DashboardLayout title="Erreur">
        <div className="text-red-500">Erreur: {studentError.message}</div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout title="Erreur">
        <div className="text-red-500">Profil étudiant non trouvé. Veuillez vous reconnecter.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Gestion des Documents"
      showLogo={true}
      icon={<FileText className="h-8 w-8 text-blue-500 p-1.5 bg-blue-100 rounded-md" />}
    >
      <CreateDocumentRequestDialog
        schoolId={student.schoolId ?? null}
        customTrigger={
          <Button
            variant="default"
            onClick={() => console.log('Trigger button clicked')}
          >
            Demander un document
          </Button>
        }
      />
    </DashboardLayout>
  );
}