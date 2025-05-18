import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Internship, Company } from "@shared/schema";
import { 
  Building, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export default function ValidateOffers() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [internshipToValidate, setInternshipToValidate] = useState<Internship | null>(null);
  const [validationAction, setValidationAction] = useState<"approve" | "reject" | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch internships
  const { data: internships, isLoading: isLoadingInternships, error: internshipsError } = useQuery<Internship[]>({
    queryKey: ["/api/internships"],
  });

  // Fetch companies
  const { data: companies, isLoading: isLoadingCompanies, error: companiesError } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // Loading and error states
  const isLoading = isLoadingInternships || isLoadingCompanies;

  if (internshipsError || companiesError) {
    return (
      <DashboardLayout title="Validation des offres">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-500">
              Impossible de charger les données. Veuillez réessayer.
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                queryClient.invalidateQueries(["http://localhost:8080/api/internships"]);
                queryClient.invalidateQueries(["http://localhost:8080/api/companies"]);
              }}
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Update internship status mutation
  const updateInternshipStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `http://localhost:8080/api/internships/${id}`, { status });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Vous n'êtes pas autorisé à modifier le statut de cette offre. Vérifiez votre token ou permissions.");
        }
        if (response.status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
        if (response.status === 404) {
          throw new Error("Offre de stage non trouvée.");
        }
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internships"] });
      setShowValidationDialog(false);
      toast({
        title: validationAction === "approve" ? "Offre approuvée" : "Offre rejetée",
        description: validationAction === "approve"
          ? "L'offre de stage a été approuvée et est maintenant visible pour les étudiants."
          : "L'offre de stage a été rejetée.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive",
      });
      if (error.message.includes("Session expirée")) {
        navigate("/login");
      }
    },
  });

  // Handle validation
  const handleValidation = (internship: Internship, action: "approve" | "reject") => {
    setInternshipToValidate(internship);
    setValidationAction(action);
    setShowValidationDialog(true);
  };

  const confirmValidation = () => {
    if (internshipToValidate && validationAction) {
      updateInternshipStatusMutation.mutate({
        id: internshipToValidate.id,
        status: validationAction === "approve" ? "approved" : "rejected",
      });
    }
  };

  // Filter internships based on active tab and search
  const filteredInternships = internships?.filter((internship) => {
    const statusMatch = internship.status === activeTab;
    const searchMatch =
      !searchTerm ||
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const companyMatch = companyFilter === "all" || internship.companyId.toString() === companyFilter;
    return statusMatch && searchMatch && companyMatch;
  });

  // Get company details
  const getCompanyDetails = (companyId: number) => {
    return companies?.find((company) => company.id === companyId);
  };

  // Get unique companies for filter
  const uniqueCompanies = [...new Set(internships?.map((internship) => internship.companyId))];

  return (
    <DashboardLayout title="Validation des offres">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="pending">
              En attente ({internships?.filter((i) => i.status === "pending").length || 0})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approuvées ({internships?.filter((i) => i.status === "approved").length || 0})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejetées ({internships?.filter((i) => i.status === "rejected").length || 0})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une offre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-gray-100" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-sm font-medium mb-3">Filtres</h3>
            <div className="flex flex-wrap gap-4">
              <div className="w-full md:w-64">
                <label className="text-xs text-gray-500 mb-1 block">Entreprise</label>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les entreprises" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les entreprises</SelectItem>
                    {uniqueCompanies.map((companyId) => {
                      const company = getCompanyDetails(companyId);
                      return (
                        <SelectItem key={companyId} value={companyId.toString()}>
                          {company?.name || `Entreprise ${companyId}`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setCompanyFilter("all");
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>
        )}

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="space-y-6">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <Skeleton key={index} className="w-full h-64 rounded-lg" />
                ))}
            </div>
          ) : filteredInternships && filteredInternships.length > 0 ? (
            <div className="space-y-6">
              {filteredInternships.map((internship) => {
                const company = getCompanyDetails(internship.companyId);

                return (
                  <Card key={internship.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-medium text-gray-900">{internship.title}</h3>
                            <div className="flex items-center mt-1 text-gray-500">
                              <Building className="h-4 w-4 mr-1" />
                              <span className="mr-4">{company?.name || `Entreprise ${internship.companyId}`}</span>
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{internship.location}</span>
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <Badge
                              variant="outline"
                              className={`
                                ${internship.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                                ${internship.status === "approved" ? "bg-green-100 text-green-800 border-green-200" : ""}
                                ${internship.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" : ""}
                              `}
                            >
                              {internship.status === "pending" && "En attente"}
                              {internship.status === "approved" && "Approuvée"}
                              {internship.status === "rejected" && "Rejetée"}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Publiée le {new Date(internship.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Durée: {internship.duration}</span>
                          </div>
                        </div>

                        <Accordion type="single" collapsible className="border rounded-md mt-4">
                          <AccordionItem value="description">
                            <AccordionTrigger className="px-4">Description</AccordionTrigger>
                            <AccordionContent className="px-4 text-gray-600">
                              {internship.description}
                            </AccordionContent>
                          </AccordionItem>

                          {internship.requirements && (
                            <AccordionItem value="requirements">
                              <AccordionTrigger className="px-4">Prérequis</AccordionTrigger>
                              <AccordionContent className="px-4 text-gray-600">
                                {internship.requirements}
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {internship.responsibilities && (
                            <AccordionItem value="responsibilities">
                              <AccordionTrigger className="px-4">Responsabilités</AccordionTrigger>
                              <AccordionContent className="px-4 text-gray-600">
                                {internship.responsibilities}
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {internship.skills && internship.skills.length > 0 && (
                            <AccordionItem value="skills">
                              <AccordionTrigger className="px-4">Compétences requises</AccordionTrigger>
                              <AccordionContent className="px-4">
                                <div className="flex flex-wrap gap-2">
                                  {internship.skills.map((skill, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="bg-blue-50 text-blue-800 border-blue-200"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </Accordion>
                      </div>

                      <Separator />

                      <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => navigate(`/internships/${internship.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          Détails complets
                        </Button>

                        {internship.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleValidation(internship, "reject")}
                              disabled={updateInternshipStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                              {updateInternshipStatusMutation.isPending &&
                              internshipToValidate?.id === internship.id
                                ? "Rejet en cours..."
                                : "Rejeter"}
                            </Button>
                            <Button
                              size="sm"
                              className="gap-2"
                              onClick={() => handleValidation(internship, "approve")}
                              disabled={updateInternshipStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                              {updateInternshipStatusMutation.isPending &&
                              internshipToValidate?.id === internship.id
                                ? "Approbation en cours..."
                                : "Approuver"}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  {activeTab === "pending" && <Clock className="h-8 w-8 text-yellow-500" />}
                  {activeTab === "approved" && <CheckCircle className="h-8 w-8 text-green-500" />}
                  {activeTab === "rejected" && <XCircle className="h-8 w-8 text-red-500" />}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === "pending" && "Aucune offre en attente"}
                  {activeTab === "approved" && "Aucune offre approuvée"}
                  {activeTab === "rejected" && "Aucune offre rejetée"}
                </h3>
                <p className="text-gray-500 text-center max-w-md mb-4">
                  {activeTab === "pending" && "Toutes les offres de stage ont été examinées."}
                  {activeTab === "approved" && "Vous n'avez pas encore approuvé d'offres de stage."}
                  {activeTab === "rejected" && "Vous n'avez pas encore rejeté d'offres de stage."}
                </p>
                <Button
                  onClick={() => queryClient.invalidateQueries(["http://localhost:8080/api/internships"])}
                >
                  Rafraîchir
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Validation Confirmation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationAction === "approve"
                ? "Approuver l'offre de stage"
                : "Rejeter l'offre de stage"}
            </DialogTitle>
            <DialogDescription>
              {validationAction === "approve"
                ? "En approuvant cette offre, elle deviendra visible pour tous les étudiants. Êtes-vous sûr de vouloir continuer ?"
                : "En rejetant cette offre, elle ne sera pas visible pour les étudiants. L'entreprise sera notifiée de cette décision. Êtes-vous sûr de vouloir continuer ?"}
            </DialogDescription>
          </DialogHeader>
          {internshipToValidate && (
            <div className="py-2">
              <h4 className="font-medium">{internshipToValidate.title}</h4>
              <p className="text-sm text-gray-500">
                Entreprise ID: {internshipToValidate.companyId}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowValidationDialog(false)}
              disabled={updateInternshipStatusMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant={validationAction === "reject" ? "destructive" : "default"}
              onClick={confirmValidation}
              disabled={updateInternshipStatusMutation.isPending}
            >
              {updateInternshipStatusMutation.isPending
                ? "Traitement en cours..."
                : validationAction === "approve"
                ? "Confirmer l'approbation"
                : "Confirmer le rejet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}