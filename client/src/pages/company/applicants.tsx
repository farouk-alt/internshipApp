import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Application, Internship } from "@shared/schema";
import { User, Briefcase, FileText, Eye, Download, Check, X, Clock, MessageSquare, Search, SlidersHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Applicants() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false);
  const [selectedInternshipFilter, setSelectedInternshipFilter] = useState<string>("all");
  const [applicationToUpdate, setApplicationToUpdate] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Fetch internships to get details for each application
  const { data: internships, isLoading: isLoadingInternships } = useQuery<Internship[]>({
    queryKey: ["/api/internships"],
  });

  // Loading state
  const isLoading = isLoadingApplications || isLoadingInternships;

  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PUT", `/api/applications/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la candidature a été mis à jour avec succès.",
      });
      setShowStatusDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive",
      });
    },
  });

  // Handle status update
  const handleUpdateStatus = (application: Application, status: string) => {
    setApplicationToUpdate(application);
    setNewStatus(status);
    setShowStatusDialog(true);
  };

  const confirmUpdateStatus = () => {
    if (applicationToUpdate && newStatus) {
      updateApplicationMutation.mutate({ 
        id: applicationToUpdate.id, 
        status: newStatus 
      });
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "accepted": return "Accepté";
      case "rejected": return "Refusé";
      case "interviewing": return "Entretien";
      default: return status;
    }
  };

  // Filter applications
  const filteredApplications = applications?.filter((app) => {
    // Filter by tab (status)
    const statusMatch = activeTab === "all" || app.status === activeTab;
    
    // Filter by internship
    const internshipMatch = selectedInternshipFilter === "all" || app.internshipId.toString() === selectedInternshipFilter;
    
    // Filter by search term (would need student data to search by name)
    const searchMatch = !searchTerm || true; // Placeholder for actual search logic
    
    return statusMatch && internshipMatch && searchMatch;
  });

  // Get internship details for an application
  const getInternshipDetails = (internshipId: number) => {
    return internships?.find(i => i.id === internshipId);
  };

  return (
    <DashboardLayout title="Candidats">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="interviewing">Entretien</TabsTrigger>
            <TabsTrigger value="accepted">Acceptés</TabsTrigger>
            <TabsTrigger value="rejected">Refusés</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              className="md:hidden"
              onClick={() => setShowFiltersOnMobile(!showFiltersOnMobile)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="hidden md:block">
              <Select 
                value={selectedInternshipFilter} 
                onValueChange={setSelectedInternshipFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par offre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les offres</SelectItem>
                  {internships?.map(internship => (
                    <SelectItem key={internship.id} value={internship.id.toString()}>
                      {internship.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Mobile Filters (Collapsible) */}
        {showFiltersOnMobile && (
          <div className="md:hidden mb-6">
            <Select 
              value={selectedInternshipFilter} 
              onValueChange={setSelectedInternshipFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par offre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les offres</SelectItem>
                {internships?.map(internship => (
                  <SelectItem key={internship.id} value={internship.id.toString()}>
                    {internship.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <Skeleton key={index} className="w-full h-40 rounded-lg" />
              ))}
            </div>
          ) : filteredApplications && filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((application) => {
                const internship = getInternshipDetails(application.internshipId);
                if (!internship) return null;

                return (
                  <Card key={application.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium">Student Name</h3>
                            <p className="text-sm text-gray-500">student@example.com</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`
                            ${application.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                            ${application.status === "accepted" ? "bg-green-100 text-green-800 border-green-200" : ""}
                            ${application.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" : ""}
                            ${application.status === "interviewing" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                          `}
                        >
                          {getStatusLabel(application.status)}
                        </Badge>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="font-medium">{internship.title}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Candidature reçue le {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="h-4 w-4" />
                          CV
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Lettre de motivation
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Télécharger les documents
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Contacter
                        </Button>
                      </div>

                      <div className="mt-4 pt-4 border-t flex flex-wrap justify-end gap-2">
                        {application.status !== "accepted" && (
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleUpdateStatus(application, "accepted")}
                          >
                            <Check className="h-4 w-4" />
                            Accepter
                          </Button>
                        )}
                        {application.status !== "rejected" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleUpdateStatus(application, "rejected")}
                          >
                            <X className="h-4 w-4" />
                            Refuser
                          </Button>
                        )}
                        {application.status !== "interviewing" && application.status !== "accepted" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleUpdateStatus(application, "interviewing")}
                          >
                            <Clock className="h-4 w-4" />
                            Proposer un entretien
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun candidat trouvé</h3>
              <p className="text-gray-500 max-w-md mb-4">
                {activeTab === "all" 
                  ? "Vous n'avez pas encore reçu de candidatures." 
                  : `Vous n'avez pas de candidats ${activeTab === "pending" ? "en attente" : 
                     activeTab === "accepted" ? "acceptés" : 
                     activeTab === "interviewing" ? "en phase d'entretien" : "refusés"}.`}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Status Update Confirmation Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === "accepted" && "Accepter la candidature"}
              {newStatus === "rejected" && "Refuser la candidature"}
              {newStatus === "interviewing" && "Proposer un entretien"}
            </DialogTitle>
            <DialogDescription>
              {newStatus === "accepted" && "Vous êtes sur le point d'accepter cette candidature. L'étudiant sera notifié de votre décision."}
              {newStatus === "rejected" && "Vous êtes sur le point de refuser cette candidature. L'étudiant sera notifié de votre décision."}
              {newStatus === "interviewing" && "Vous êtes sur le point de proposer un entretien à cet étudiant. Il sera notifié de votre décision."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              disabled={updateApplicationMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant={newStatus === "rejected" ? "destructive" : "default"}
              onClick={confirmUpdateStatus}
              disabled={updateApplicationMutation.isPending}
            >
              {updateApplicationMutation.isPending
                ? "Traitement en cours..."
                : newStatus === "accepted"
                ? "Confirmer l'acceptation"
                : newStatus === "rejected"
                ? "Confirmer le refus"
                : "Confirmer l'entretien"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
