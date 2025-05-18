import { useQuery } from "@tanstack/react-query";
import { DocumentRequest } from "@shared/schema";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CreateDocumentRequestDialog } from "./create-document-request-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";

interface DocumentRequestsListProps {
  schoolId: number;
  limit?: number;
  compact?: boolean;
}

export function DocumentRequestsList({
  schoolId,
  limit,
  compact = false,
}: DocumentRequestsListProps) {
  const { user } = useAuth();

  const getRequestTypeLabel = useCallback((type: string = "") => {
    const types: Record<string, string> = {
      convention_stage: "Convention de stage",
      attestation_scolarite: "Attestation de scolarité",
      attestation_reussite: "Attestation de réussite",
      releve_notes: "Relevé de notes",
      autre: "Autre document",
    };
    return types[type] || "Type inconnu";
  }, []);

  const getStatusBadgeVariant = useCallback((status: string = "") => {
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
  }, []);

  const getStatusLabel = useCallback((status: string = "") => {
    const statuses: Record<string, string> = {
      pending: "En attente",
      in_progress: "En cours",
      completed: "Complété",
      rejected: "Refusé",
    };
    return statuses[status] || "Statut inconnu";
  }, []);

  const { data: requests, isLoading, error, refetch } = useQuery<
    DocumentRequest[]
  >({
    queryKey: ["/api/document-requests/student"],
    enabled: user?.userType === "STUDENT",
    queryFn: async () => {
      const response = await fetch(
        "http://localhost:8080/api/document-requests/student",
        {
          credentials: "include", // Include cookies for authentication
        }
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Mes demandes de documents</h2>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    let errorMessage =
      "Une erreur est survenue lors du chargement des demandes de documents.";
    if (error.message.includes("404")) {
      errorMessage = "Service indisponible ou aucune demande trouvée.";
    } else if (error.message.includes("401")) {
      errorMessage = "Veuillez vous connecter pour voir vos demandes.";
    } else if (error.message.includes("SyntaxError")) {
      errorMessage = "Réponse inattendue du serveur.";
    }
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-500">
        {errorMessage}
        <button onClick={() => refetch()} className="ml-2 underline">
          Réessayer
        </button>
      </div>
    );
  }

  const displayRequests = limit && requests ? requests.slice(0, limit) : requests;

  if (compact && displayRequests) {
    return (
      <div className="space-y-2">
        {displayRequests.length > 0 ? (
          displayRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50"
            >
              <div>
                <div className="font-medium text-sm">
                  {getRequestTypeLabel(request.requestType)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(request.createdAt || new Date()), "dd/MM/yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>
              <Badge
                variant={getStatusBadgeVariant(request.status)}
                className="ml-auto"
              >
                {getStatusLabel(request.status)}
              </Badge>
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-muted-foreground text-sm">
            Aucune demande de document pour le moment.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Mes demandes de documents</h2>
          <CreateDocumentRequestDialog schoolId={schoolId} />
        </div>
      )}

      {displayRequests && displayRequests.length > 0 ? (
        <Table aria-label="Liste des demandes de documents">
          {!compact && (
            <TableCaption>Liste de vos demandes de documents</TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Type de document</TableHead>
              <TableHead scope="col">Date de demande</TableHead>
              <TableHead scope="col">Statut</TableHead>
              <TableHead scope="col">Message</TableHead>
              <TableHead scope="col">Dernière mise à jour</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {getRequestTypeLabel(request.requestType)}
                </TableCell>
                <TableCell>
                  {format(new Date(request.createdAt || new Date()), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {request.message}
                </TableCell>
                <TableCell>
                  {format(new Date(request.updatedAt || new Date()), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="bg-primary-foreground text-center p-8 rounded-md">
          <p className="text-lg mb-4">
            Vous n'avez pas encore fait de demande de document.
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            Utilisez le bouton ci-dessous pour faire une nouvelle demande.
          </p>
          {!compact && <CreateDocumentRequestDialog schoolId={schoolId} />}
        </div>
      )}
    </div>
  );
}