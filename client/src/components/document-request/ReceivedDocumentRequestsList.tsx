import { useQuery } from "@tanstack/react-query";
import { DocumentRequest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReceivedDocumentRequestsListProps {
  schoolId: number;
}

export function ReceivedDocumentRequestsList({ schoolId }: ReceivedDocumentRequestsListProps) {
  const { data: requests, isLoading, error } = useQuery<DocumentRequest[]>({
    queryKey: ["/api/document-requests/received", schoolId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8080/api/document-requests/received?schoolId=${schoolId}`);
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
    enabled: !!schoolId,
  });

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

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      pending: "En attente",
      in_progress: "En cours",
      completed: "Complété",
      rejected: "Refusé",
    };
    return statuses[status] || status;
  };

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement</p>;
  if (!requests || requests.length === 0) return <p>Aucune demande reçue.</p>;

  return (
    <ul className="space-y-3">
      {requests.map((req) => (
        <li key={req.id} className="border rounded-md p-3">
          <p><strong>{req.student?.fullName}</strong> a demandé <em>{getRequestTypeLabel(req.requestType)}</em></p>
          <p>Date : {format(new Date(req.createdAt), "dd MMMM yyyy", { locale: fr })}</p>
          <Badge>{getStatusLabel(req.status)}</Badge>
        </li>
      ))}
    </ul>
  );
}
