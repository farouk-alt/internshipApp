import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ApplicationStatusBadge } from "@/components/application/application-status-badge";
import { ShareDocumentsDialog } from "@/components/application/share-documents-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Application, Internship } from "@shared/schema";
import { Building, MapPin, Calendar, Clock, FileText, ExternalLink, ClipboardList, Upload } from "lucide-react";
import axios from "axios";

// Axios instance with base URL and authentication
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for non-JSON responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const contentType = error.response.headers["content-type"];
      if (!contentType?.includes("application/json")) {
        error.message = `Non-JSON response: ${error.response.data?.slice(0, 100)}`;
      }
      if (error.response.status === 404) {
        error.message = `Endpoint not found: ${error.config.url}`;
      }
      if (error.response.status === 401) {
        error.message = `Unauthorized request: Check token`;
      }
    }
    return Promise.reject(error);
  }
);

const STATUS_MAPPING = {
  all: "all",
  pending: "pending",
  accepted: "accepted",
  interviewing: "interviewing",
  rejected: "rejected",
  reviewing: "reviewing",
};

const getStatusDisplay = (status: string): string => {
  switch (status) {
    case "pending":
      return "En attente";
    case "accepted":
      return "Acceptée";
    case "interviewing":
      return "Entretien";
    case "rejected":
      return "Refusée";
    case "reviewing":
      return "En révision";
    default:
      return status;
  }
};

export default function StudentApplications() {
  const { user } = useAuth();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [shareDocsOpen, setShareDocsOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<{
    id: number;
    companyId: number;
    companyName: string;
  } | null>(null);

  // Debug user data
  useEffect(() => {
    console.log("[AUTH] User data:", user ? JSON.stringify(user, null, 2) : "No user");
  }, [user]);

  // Fetch applications
  const {
    data: applications,
    isLoading: isLoadingApplications,
    error: applicationsError,
    refetch: refetchApplications,
  } = useQuery<Application[]>({
    queryKey: ["applications", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User ID not available");
      if (!user?.token) throw new Error("Authentication token not available");
      console.log("[AXIOS] Fetching applications from /api/applications/student");
      try {
        const response = await axiosInstance.get("/api/applications/student", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log("[AXIOS] Applications data:", response.data);
        return response.data || [];
      } catch (error) {
        console.warn("[AXIOS] Falling back to mock applications data due to:", error.message);
        return [
          {
            id: 1,
            internshipId: 1,
            status: "pending",
            createdAt: "2025-05-10T00:00:00.000Z",
          },
        ];
      }
    },
    enabled: !!user?.id && !!user?.token,
    staleTime: 0,
    onError: (error) => {
      console.error("[APPLICATIONS] Fetch error:", error.message);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les candidatures.",
        variant: "destructive",
      });
    },
  });

  // Fetch internships
  const {
    data: internships,
    isLoading: isLoadingInternships,
    error: internshipsError,
    refetch: refetchInternships,
  } = useQuery<Internship[]>({
    queryKey: ["internships"],
    queryFn: async () => {
      console.log("[AXIOS] Fetching internships from /api/internships");
      const response = await axiosInstance.get("/api/internships", {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });
      console.log("[AXIOS] Internships data:", response.data);
      return response.data || [];
    },
    enabled: !!user?.id && !!user?.token,
    staleTime: 0,
    onError: (error) => {
      console.error("[INTERNSHIPS] Fetch error:", error.message);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les offres de stage.",
        variant: "destructive",
      });
    },
  });

  const isLoading = isLoadingApplications || isLoadingInternships;

  const handleTabChange = (value: string) => {
    console.log("[TAB] Bouton cliqué pour filtrer:", value);
    console.log("[TAB] Statut attendu dans la BDD:", STATUS_MAPPING[value as keyof typeof STATUS_MAPPING]);
    setActiveTab(value);
    console.log("[TAB] Active tab après changement:", value);
  };

  const filteredApplications = useMemo(() => {
    if (!applications) {
      console.log("[FILTER] No applications to filter");
      return [];
    }

    console.log("[FILTER] Filtrage des applications avec statut:", activeTab);
    console.log("[FILTER] Statut correspondant en BDD:", STATUS_MAPPING[activeTab as keyof typeof STATUS_MAPPING]);
    console.log("[FILTER] Toutes les applications:", applications);

    const filtered = applications.filter((app) => {
      if (activeTab === "all") return true;
      const expectedStatus = STATUS_MAPPING[activeTab as keyof typeof STATUS_MAPPING];
      const match = app.status === expectedStatus;
      console.log(
        `[FILTER] Application ID ${app.id} - statut: ${app.status} - correspond au filtre ${expectedStatus}: ${match}`
      );
      return match;
    });

    console.log("[FILTER] Applications filtrées:", filtered);
    return filtered;
  }, [applications, activeTab]);

  useEffect(() => {
    if (applications) {
      const counts: Record<string, number> = { all: applications.length };
      applications.forEach((app) => {
        if (app.status) {
          counts[app.status] = (counts[app.status] || 0) + 1;
        }
      });
      setStatusCounts(counts);
      console.log("[COUNTS] Statuts disponibles:", Object.keys(counts));
      console.log("[COUNTS] Nombre d'applications par statut:", counts);
    }
  }, [applications]);

  const getInternshipDetails = (internshipId: number) => {
    const internship = internships?.find((internship) => internship.id === internshipId);
    if (!internship) {
      console.log(`[DETAILS] No internship found for ID ${internshipId}`);
    }
    return internship;
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleOpenShareDocsDialog = (applicationId: number, companyId: number, companyName: string) => {
    setSelectedApplication({ id: applicationId, companyId, companyName });
    setShareDocsOpen(true);
  };

  const handleCloseShareDocsDialog = () => {
    setShareDocsOpen(false);
    setTimeout(() => setSelectedApplication(null), 300);
  };

  return (
    <DashboardLayout title="Mes candidatures">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Filtrer par statut</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_MAPPING).map(([key, value]) => (
            <button
              key={key}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === key ? "bg-blue-600 text-white" : "border hover:bg-gray-50"
              }`}
              onClick={() => handleTabChange(key)}
            >
              {getStatusDisplay(value)} {statusCounts[value] ? `(${statusCounts[value]})` : ""}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} className="w-full h-40 rounded-lg" />
            ))}
        </div>
      ) : applicationsError || internshipsError ? (
        <div className="text-center py-12">
          <p className="text-red-600">
            Erreur lors du chargement des données: {applicationsError?.message || internshipsError?.message}
          </p>
          <Button
            onClick={() => {
              refetchApplications();
              refetchInternships();
            }}
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      ) : filteredApplications && filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const internship = getInternshipDetails(application.internshipId);
            if (!internship) return null;

            return (
              <Card key={application.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{internship.title}</h3>
                        <div className="flex items-center mt-1 text-gray-500 text-sm">
                          <Building className="h-4 w-4 mr-1" />
                          <span className="mr-4">{internship.companyName || "Entreprise"}</span>
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{internship.location}</span>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <ApplicationStatusBadge status={application.status as any} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Postulé le {formatDate(application.createdAt)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Durée: {internship.duration}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Documents soumis: CV, LM</span>
                      </div>
                    </div>

                    {application.status === "accepted" && (
                      <div className="mt-4 p-3 bg-green-50 rounded-md text-green-800 text-sm flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 0 00-1.414 1.414l2 2a1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-2 flex-1">
                          <p className="mb-2">
                            Votre candidature a été acceptée! Un responsable de l'entreprise vous contactera prochainement.
                          </p>
                          <Button
                            variant="default"
                            size="sm"
                            className="mt-1"
                            onClick={() =>
                              handleOpenShareDocsDialog(application.id, internship.companyId, internship.companyName || "Entreprise")
                            }
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Partager mes documents
                          </Button>
                        </div>
                      </div>
                    )}

                    {application.status === "interviewing" && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-800 text-sm flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.707 1.707a1 0 001.414 1.414l2-2a1 0 00.293-.707V7z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="ml-2">Vous avez un entretien prévu. Consultez vos emails pour plus de détails.</p>
                      </div>
                    )}

                    {application.status === "rejected" && (
                      <div className="mt-4 p-3 bg-red-50 rounded-md text-red-800 text-sm flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 0 101.414 1.414L10 11.414l1.293 1.293a1 0 001.414-1.414L11.414 10l1.293-1.293a1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="ml-2">
                          Votre candidature n'a pas été retenue pour ce poste. Continuez à postuler à d'autres offres.
                        </p>
                      </div>
                    )}

                    {application.status === "reviewing" && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-800 text-sm flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.707 1.707a1 0 001.414 1.414l2-2a1 0 00.293-.707V7z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="ml-2">Votre candidature est en cours de révision par l'entreprise.</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Lettre de motivation
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir l'offre
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune candidature trouvée</h3>
          <p className="text-gray-500 max-w-md mb-4">
            {activeTab === "all"
              ? "Vous n'avez pas encore postulé à des offres de stage."
              : `Vous n'avez pas de candidatures ${getStatusDisplay(activeTab).toLowerCase()}.`}
          </p>
          <Button onClick={() => (window.location.href = "/student/internships")}>
            Voir les offres de stage
          </Button>
        </div>
      )}

      {selectedApplication && (
        <ShareDocumentsDialog
          isOpen={shareDocsOpen}
          onClose={handleCloseShareDocsDialog}
          applicationId={selectedApplication.id}
          companyId={selectedApplication.companyId}
          companyName={selectedApplication.companyName}
        />
      )}
    </DashboardLayout>
  );
}