import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Document, SharedDocument } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Send, Download, Eye, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Type pour les documents partagés enrichis avec les informations du document
interface EnrichedSharedDocument extends SharedDocument {
  document?: Document;
}

interface SharedDocumentsListProps {
  onRequestDocument?: () => void;
  limit?: number;
  compact?: boolean;
}

export function SharedDocumentsList({ onRequestDocument, limit, compact = false }: SharedDocumentsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<EnrichedSharedDocument | null>(null);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  // Récupérer les documents partagés avec l'utilisateur
  const { data: sharedDocuments, isLoading: isLoadingDocuments } = useQuery<EnrichedSharedDocument[]>({
    queryKey: ["/api/documents/shared"],
    enabled: !!user,
  });

  // Récupérer les entreprises disponibles (pour le transfert)
  const { data: companies, isLoading: isLoadingCompanies } = useQuery<any[]>({
    queryKey: ["/api/companies"],
    enabled: !!user && user.userType === "STUDENT",
  });

  // Mutation pour transférer un document à une entreprise
  const forwardDocumentMutation = useMutation({
    mutationFn: async ({ documentId, companyId }: { documentId: number; companyId: number }) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/forward`, {
        companyId,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du transfert du document");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document transféré",
        description: "Le document a été transféré avec succès à l'entreprise",
      });
      setForwardDialogOpen(false);
      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["/api/documents/shared"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fonction pour ouvrir le dialogue de transfert
  const handleForwardDocument = (doc: EnrichedSharedDocument) => {
    setSelectedDocument(doc);
    setForwardDialogOpen(true);
  };

  // Fonction pour exécuter le transfert
  const confirmForward = () => {
    if (selectedDocument && selectedCompanyId) {
      forwardDocumentMutation.mutate({
        documentId: selectedDocument.documentId,
        companyId: selectedCompanyId,
      });
    }
  };

  // Fonction pour télécharger un document
  const downloadDocument = (doc: EnrichedSharedDocument) => {
    if (doc.document) {
      window.open(`/api/documents/download/${doc.document.path}`, "_blank");
    }
  };

  // Fonction pour visualiser un document
  const viewDocument = (doc: EnrichedSharedDocument) => {
    if (doc.document) {
      const fileName = doc.document.path.split("/").pop();
      window.open(`/api/documents/view/${fileName}`, "_blank");
    }
  };

  // Obtenir le type de document en format lisible
  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      cv: "CV",
      motivationLetter: "Lettre de motivation",
      convention_stage: "Convention de stage",
      attestation_scolarite: "Attestation de scolarité",
      attestation_reussite: "Attestation de réussite",
      releve_notes: "Relevé de notes",
      autre: "Autre document",
    };
    return types[type] || type;
  };

  if (isLoadingDocuments) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Documents partagés avec vous</h2>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Limiter le nombre de documents affichés si nécessaire
  const displayDocuments = limit && sharedDocuments 
    ? sharedDocuments.slice(0, limit) 
    : sharedDocuments;

  // Mode compact pour l'affichage dans les widgets
  if (compact && displayDocuments && displayDocuments.length > 0) {
    return (
      <div className="space-y-2">
        {displayDocuments.map((shared) => (
          <div key={shared.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
            <div className="flex items-center">
              <div className="p-1.5 bg-blue-50 rounded-md mr-2">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="font-medium text-sm">
                  {shared.document?.name || "Document"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {shared.documentType 
                    ? getDocumentTypeLabel(shared.documentType)
                    : shared.document?.type 
                      ? getDocumentTypeLabel(shared.document.type)
                      : "Document"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                {format(new Date(shared.sharedAt || new Date()), "dd/MM/yyyy", { locale: fr })}
              </div>
              {shared.forwardedToCompanyId ? (
                <Badge variant="default" className="flex items-center gap-1 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Transféré
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Reçu</Badge>
              )}
            </div>
          </div>
        ))}
        {displayDocuments.length === 0 && (
          <div className="text-center p-4 text-muted-foreground text-sm">
            Aucun document partagé pour le moment.
          </div>
        )}
      </div>
    );
  }

  // Affichage normal
  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Documents partagés avec vous</h2>
          {onRequestDocument && (
            <Button onClick={onRequestDocument} variant="outline">
              Demander un document
            </Button>
          )}
        </div>
      )}

      {displayDocuments && displayDocuments.length > 0 ? (
        <Table>
          {!compact && <TableCaption>Liste des documents partagés avec vous</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead>Nom du document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Partagé le</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayDocuments.map((shared) => (
              <TableRow key={shared.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    {shared.document?.name || "Document"}
                  </div>
                </TableCell>
                <TableCell>
                  {shared.documentType 
                    ? getDocumentTypeLabel(shared.documentType)
                    : shared.document?.type 
                      ? getDocumentTypeLabel(shared.document.type)
                      : "Document"}
                </TableCell>
                <TableCell>
                  {format(new Date(shared.sharedAt || new Date()), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell>
                  {shared.forwardedToCompanyId ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Transféré
                    </Badge>
                  ) : (
                    <Badge variant="outline">Reçu</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewDocument(shared)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(shared)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                    {user?.userType === "STUDENT" && !shared.forwardedToCompanyId && (
                      <Button
                        size="sm"
                        onClick={() => handleForwardDocument(shared)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Transférer
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="bg-primary-foreground text-center p-8 rounded-md">
          <p className="text-lg mb-4">
            Aucun document n'a été partagé avec vous pour le moment.
          </p>
          {user?.userType === "STUDENT" && onRequestDocument && (
            <p className="mb-6 text-sm text-muted-foreground">
              Utilisez le bouton "Demander un document" pour faire une demande à
              votre établissement.
            </p>
          )}
        </div>
      )}

      {/* Dialogue pour transférer un document à une entreprise */}
      {selectedDocument && (
        <Dialog open={forwardDialogOpen} onOpenChange={setForwardDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Transférer le document</DialogTitle>
              <DialogDescription>
                Sélectionnez l'entreprise à laquelle vous souhaitez transférer ce
                document.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Document à transférer</h3>
                <div className="flex items-center p-2 bg-muted rounded-md">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  <span>
                    {selectedDocument.document?.name || "Document"} (
                    {selectedDocument.documentType 
                      ? getDocumentTypeLabel(selectedDocument.documentType)
                      : selectedDocument.document?.type 
                        ? getDocumentTypeLabel(selectedDocument.document.type)
                        : "Document"}
                    )
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Entreprise</h3>
                {isLoadingCompanies ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    onValueChange={(value) => setSelectedCompanyId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies && companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setForwardDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={confirmForward}
                disabled={!selectedCompanyId || forwardDocumentMutation.isPending}
              >
                {forwardDocumentMutation.isPending ? (
                  "Transfert en cours..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Transférer le document
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}