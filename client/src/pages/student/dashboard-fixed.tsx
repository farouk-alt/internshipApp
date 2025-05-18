import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Student } from "@shared/schema";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2 } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Queries
  const { data: profile, isLoading: profileLoading } = useQuery<Student>({
    queryKey: ["/api/profile/student"],
    enabled: !!user
  });
  
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications/student"],
    enabled: !!user,
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    document.title = "Tableau de bord étudiant - Intega";
  }, []);

  if (profileLoading || applicationsLoading) {
    return (
      <DashboardLayout title="Tableau de bord Étudiant" showLogo={true}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tableau de bord Étudiant" showLogo={true}>
      <div className="w-full space-y-8 p-6">
        <div>
          <h1 className="text-2xl font-bold mb-4">Bienvenue, {user?.username}</h1>
          <p className="text-gray-600">
            Voici un aperçu de votre activité sur la plateforme Intega.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Candidatures</h2>
            <div className="flex items-center justify-between mb-3">
              <p className="text-2xl font-bold">
                {Array.isArray(applicationsData) ? applicationsData.length : 0}
              </p>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                📝
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {Array.isArray(applicationsData) && applicationsData.length > 0
                ? "Suivez vos candidatures en cours"
                : "Aucune candidature pour le moment"}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Documents</h2>
            <div className="flex items-center justify-between mb-3">
              <p className="text-2xl font-bold">--</p>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                📄
              </div>
            </div>
            <p className="text-sm text-gray-600">Gérez vos documents importants</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Entretiens</h2>
            <div className="flex items-center justify-between mb-3">
              <p className="text-2xl font-bold">--</p>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                📅
              </div>
            </div>
            <p className="text-sm text-gray-600">Consultez vos prochains rendez-vous</p>
          </div>
        </div>

        {/* Dernières candidatures */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Vos dernières candidatures</h2>
          
          {Array.isArray(applicationsData) && applicationsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(applicationsData as any[]).slice(0, 5).map((application: any) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {application.internshipTitle || "Stage"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.companyName || "Entreprise"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
                            application.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {application.status === 'ACCEPTED' ? 'Acceptée' : 
                           application.status === 'REJECTED' ? 'Refusée' : 
                           application.status === 'PENDING' ? 'En attente' : 'En cours'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "Date inconnue"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Vous n'avez pas encore de candidatures.</p>
              <p className="text-gray-500 mt-2">Découvrez nos offres de stage pour démarrer votre recherche.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}