import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocumentRequest } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ReceivedDocumentRequestsList } from "@/components/ReceivedDocumentRequestsList";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Upload, CheckCircle, XCircle, Clock, FileUp, FileEdit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { ShareDocumentDialog } from "../document/share-document-dialog";

// Type pour les données enrichies des demandes
interface EnrichedDocumentRequest extends DocumentRequest {
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    program?: string;
  };
  application?: {
    id: number;
    status: string;
    internshipId: number;
  };
}

export function SchoolDocumentRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeRequest, setActiveRequest] = useState<EnrichedDocumentRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Récupérer les demandes de documents pour l'école
  const { data: requests, isLoading, error } = useQuery<EnrichedDocumentRequest[]>({
    queryKey: ["/api/document-requests/school"],
    enabled: user?.userType === "SCHOOL",
  });

  // Mutation pour mettre à jour le statut d'une demande
  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/document-requests/${id}`, { status });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour de la demande");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la demande a été mis à jour avec succès",
      });
      setDialogOpen(false);
      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["/api/document-requests/school"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Obtenir le label en fonction du type de document
  const getRequestTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      convention_stage: "Convention de stage",
      attestation_scolarite: "Attestation de scolarité",
      attestation_reussite: "Attestation de réussite",
      releve_notes: "Relevé de notes",
      autre: "Autre document",
    };
    return types[type] || type;
  };

  // Obtenir la couleur du badge en fonction du statut
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline";
      case "in_progress":
        return "secondary";
      case "completed":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Traduire le statut en français
  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      pending: "En attente",
      in_progress: "En cours de traitement",
      completed: "Complété",
      rejected: "Refusé",
    };
    return statuses[status] || status;
  };

  // Filtrer les demandes en fonction de l'onglet actif
  const filteredRequests = requests?.filter((request) => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  // Ouvrir le dialogue avec la demande sélectionnée
  const handleRequestClick = (request: EnrichedDocumentRequest) => {
    setActiveRequest(request);
    setDialogOpen(true);
  };

  // Marquer la demande comme "en cours de traitement"
  const handleProcessRequest = () => {
    if (activeRequest) {
      updateRequestStatusMutation.mutate({
        id: activeRequest.id,
        status: "in_progress",
      });
    }
  };

  // Marquer la demande comme "complétée"
  const handleCompleteRequest = () => {
    if (activeRequest) {
      updateRequestStatusMutation.mutate({
        id: activeRequest.id,
        status: "completed",
      });
    }
  };

  // Marquer la demande comme "refusée"
  const handleRejectRequest = () => {
    if (activeRequest) {
      updateRequestStatusMutation.mutate({
        id: activeRequest.id,
        status: "rejected",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Demandes de documents</h2>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-500">
        Une erreur est survenue lors du chargement des demandes de documents.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Demandes de documents</h2>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="in_progress">En cours</TabsTrigger>
          <TabsTrigger value="completed">Complétés</TabsTrigger>
          <TabsTrigger value="rejected">Refusés</TabsTrigger>
          <TabsTrigger value="all">Tous</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredRequests && filteredRequests.length > 0 ? (
            <Table>
              <TableCaption>Liste des demandes de documents</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Type de document</TableHead>
                  <TableHead>Date de demande</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRequestClick(request)}>
                    <TableCell className="font-medium">
                      {request.student ? (
                        <div>
                          <div>{request.student.firstName} {request.student.lastName}</div>
                          <div className="text-xs text-muted-foreground">{request.student.program}</div>
                        </div>
                      ) : (
                        "Étudiant inconnu"
                      )}
                    </TableCell>
                    <TableCell>{getRequestTypeLabel(request.requestType)}</TableCell>
                    <TableCell>
                      {format(new Date(request.createdAt), "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRequest(request);
                            handleProcessRequest();
                          }}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Traiter
                        </Button>
                      )}
                      {request.status === "in_progress" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveRequest(request);
                              setDialogOpen(true);
                            }}
                          >
                            <FileEdit className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                          
                          {request.student && (
                            <ShareDocumentDialog 
                              userIdToShareWith={request.student.userId} 
                              documentRequestId={request.id}
                              onShareSuccess={() => {
                                handleCompleteRequest();
                              }}
                              trigger={
                                <Button size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Envoyer
                                </Button>
                              }
                            />
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="bg-primary-foreground text-center p-8 rounded-md">
              <p className="text-lg mb-4">
                Aucune demande de document {activeTab !== "all" ? `"${getStatusLabel(activeTab)}"` : ""} trouvée.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogue de détails de la demande */}
      {activeRequest && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Détails de la demande</DialogTitle>
              <DialogDescription>
                Demande de {getRequestTypeLabel(activeRequest.requestType)} par{" "}
                {activeRequest.student
                  ? `${activeRequest.student.firstName} ${activeRequest.student.lastName}`
                  : "Étudiant inconnu"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Statut</h3>
                <Badge variant={getStatusBadgeVariant(activeRequest.status)}>
                  {getStatusLabel(activeRequest.status)}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Date de demande</h3>
                <p>
                  {format(new Date(activeRequest.createdAt), "dd MMMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Dernière mise à jour</h3>
                <p>
                  {format(new Date(activeRequest.updatedAt), "dd MMMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>

              {activeRequest.application && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Candidature associée</h3>
                  <p>
                    Candidature #{activeRequest.application.id} -{" "}
                    <Badge variant={activeRequest.application.status === "accepted" ? "default" : "outline"}>
                      {activeRequest.application.status === "accepted"
                        ? "Acceptée"
                        : activeRequest.application.status}
                    </Badge>
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium mb-1">Message de l'étudiant</h3>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {activeRequest.message || "Aucun message fourni."}
                </div>
              </div>
            </div>

            <DialogFooter className="flex space-x-2">
              {activeRequest.status === "pending" && (
                <>
                  <Button variant="outline" onClick={handleRejectRequest} className="border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <XCircle className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                  <Button onClick={handleProcessRequest}>
                    <Clock className="h-4 w-4 mr-2" />
                    Marquer en cours de traitement
                  </Button>
                </>
              )}

              {activeRequest.status === "in_progress" && (
                <>
                  <Button variant="outline" onClick={handleRejectRequest} className="border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <XCircle className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                  
                  {activeRequest.student && (
                    <ShareDocumentDialog 
                      userIdToShareWith={activeRequest.student.userId} 
                      documentRequestId={activeRequest.id}
                      onShareSuccess={() => {
                        handleCompleteRequest();
                      }}
                      trigger={
                        <Button>
                          <FileUp className="h-4 w-4 mr-2" />
                          Partager document
                        </Button>
                      }
                    />
                  )}
                </>
              )}

              {activeRequest.status === "completed" && (
                <Button variant="outline" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Document déjà partagé
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}