import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { InternshipCard } from "@/components/internship/internship-card";
import { InternshipFilter, FilterValues } from "@/components/internship/internship-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { Internship } from "@shared/schema";
import { Briefcase } from "lucide-react";
import { ApplyDialog } from "@/components/internship/apply-dialog";
import axios from "axios";

// Axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Debug interceptors
axiosInstance.interceptors.request.use((config) => {
  console.log(`[AXIOS] Request to: ${config.baseURL}${config.url}`);
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[AXIOS] Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error(`[AXIOS] Error for ${error.config?.url}:`, {
      status: error.response?.status,
      data: error.response?.data?.slice(0, 100),
    });
    if (error.response?.headers["content-type"]?.includes("text/html")) {
      error.message = `Received HTML instead of JSON from ${error.config.url}`;
    }
    return Promise.reject(error);
  }
);

export default function StudentInternships() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    location: "",
    skills: [],
    duration: [1, 12],
    internshipType: "all",
    educationLevel: "all",
    remoteOption: "all",
  });
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<{ id: number; title: string } | null>(null);

  // Debug component mount and user
  useEffect(() => {
    console.log("[DEBUG] StudentInternships mounted");
    console.log("[AUTH] User:", user ? JSON.stringify(user, null, 2) : "No user");
  }, [user]);

  // Fetch internships
  const { data: internships, isLoading, error, refetch } = useQuery<Internship[]>({
    queryKey:["/api/internships", user?.id],
    queryFn: async () => {
      console.log("[QUERY] Running queryFn for /api/internships");
      try {
        const response = await axiosInstance.get("/api/internships", {
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
        });
        return response.data || [];
      } catch (err) {
        console.warn("[QUERY] Using mock internships data due to:", err.message);
        return [
          {
            id: 1,
            title: "Frontend Developer Intern",
            description: "Work on React projects",
            location: "Paris",
            duration: "6 months",
            companyId: 1,
            companyName: "Tech Corp",
            skills: ["React", "JavaScript"],
          },
        ];
      }
    },
    // Temporarily disable auth requirement for testing
    enabled: true, // Change back to !!user?.id && !!user?.token after testing
    staleTime: 0,
    select: (data) => {
      console.log("[QUERY] Transforming data:", data);
      return data.map((internship: any) => ({
        ...internship,
        companyData: {
          id: internship.companyId,
          name: internship.companyName || "Entreprise",
        },
      }));
    },
    onError: (err) => {
      console.error("[QUERY] Error:", err.message);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de charger les offres de stage.",
        variant: "destructive",
      });
    },
  });

  // Debug render state
  useEffect(() => {
    console.log("[RENDER] isLoading:", isLoading);
    console.log("[RENDER] error:", error);
    console.log("[RENDER] internships:", internships);
  }, [isLoading, error, internships]);

  // Apply filters
  const filteredInternships = internships?.filter((internship) => {
    const searchMatch =
      !filters.search ||
      internship.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (internship.description?.toLowerCase().includes(filters.search.toLowerCase())) ||
      (internship.skills?.some((skill) => skill.toLowerCase().includes(filters.search.toLowerCase())));

    const locationMatch =
      !filters.location || internship.location.toLowerCase().includes(filters.location.toLowerCase());

    const skillsMatch =
      filters.skills.length === 0 ||
      filters.skills.every((skill) => internship.skills?.includes(skill));

    const durationMatch = true;

    return searchMatch && locationMatch && skillsMatch && durationMatch;
  });

  const handleOpenApplyDialog = (internshipId: number, internshipTitle: string) => {
    setSelectedInternship({ id: internshipId, title: internshipTitle });
    setApplyDialogOpen(true);
  };

  const handleCloseApplyDialog = () => {
    setApplyDialogOpen(false);
    setTimeout(() => setSelectedInternship(null), 300);
  };

  const handleSuccessfulApplication = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/applications/student"] });
  };

  return (
    <DashboardLayout title="Offres de stage">
      <div className="mb-6">
        <InternshipFilter onFilterChange={setFilters} />
      </div>

      {isLoading ? (
        <div className="space-y-4 mt-6">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} className="w-full h-32 rounded-lg" />
            ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Erreur lors du chargement des données: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Réessayer
          </Button>
        </div>
      ) : filteredInternships && filteredInternships.length > 0 ? (
        <div className="space-y-4 mt-6">
          {filteredInternships.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              company={{
                id: internship.companyId,
                name: internship.companyName || "Entreprise",
              }}
              onOpenApplyDialog={handleOpenApplyDialog}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre trouvée</h3>
          <p className="text-gray-500 max-w-md mb-4">
            Nous n'avons trouvé aucune offre de stage correspondant à vos critères de recherche. Essayez de modifier vos
            filtres.
          </p>
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                search: "",
                location: "",
                skills: [],
                duration: [1, 12],
                internshipType: "all",
                educationLevel: "all",
                remoteOption: "all",
              })
            }
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}

      {selectedInternship && (
        <ApplyDialog
          isOpen={applyDialogOpen}
          onClose={handleCloseApplyDialog}
          internshipId={selectedInternship.id}
          internshipTitle={selectedInternship.title}
          onSuccessfulApplication={handleSuccessfulApplication}
        />
      )}
    </DashboardLayout>
  );
}