import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Partnership, Company } from "@shared/schema";
import { 
  PackagePlus, 
  Search, 
  Building, 
  MoreHorizontal, 
  Eye, 
  ExternalLink, 
  Mail, 
  UserCheck, 
  UserX 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ManageCompanies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({ name: "", website: "", industry: "" });
  const [partnershipToUpdate, setPartnershipToUpdate] = useState<Partnership | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch partnerships
  const { data: partnerships, isLoading: isLoadingPartnerships } = useQuery<Partnership[]>({
    queryKey: ["/api/partnerships"],
  });

  // Fetch companies
  const { data: companies, isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // Loading state
  const isLoading = isLoadingPartnerships || isLoadingCompanies;

  // Create partnership mutation
  const createPartnershipMutation = useMutation({
    mutationFn: async (companyId: number) => {
      return await apiRequest("POST", "/api/partnerships", { companyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partnerships"] });
      setShowAddCompanyDialog(false);
      toast({
        title: "Partenariat créé",
        description: "L'entreprise a été ajoutée à vos partenaires avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du partenariat.",
        variant: "destructive",
      });
    },
  });

  // Update partnership status mutation
  const updatePartnershipMutation = useMutation({
    mutationFn: async (data: { schoolId: number; companyId: number; status: string }) => {
      return await apiRequest("PUT", `/api/partnerships/${data.schoolId}/${data.companyId}`, { status: data.status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partnerships"] });
      setShowStatusDialog(false);
      toast({
        title: "Statut mis à jour",
        description: "Le statut du partenariat a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive",
      });
    },
  });

  // Handle partnership status change
  const handleStatusChange = (partnership: Partnership) => {
    setPartnershipToUpdate(partnership);
    setShowStatusDialog(true);
  };

  // Confirm update partnership status
  const confirmStatusChange = () => {
    if (partnershipToUpdate) {
      updatePartnershipMutation.mutate({
        schoolId: partnershipToUpdate.schoolId,
        companyId: partnershipToUpdate.companyId,
        status: partnershipToUpdate.status === "active" ? "inactive" : "active"
      });
    }
  };

  // Get company details
  const getCompanyDetails = (companyId: number) => {
    return companies?.find(company => company.id === companyId);
  };

  // Filter partnerships based on search
  const filteredPartnerships = partnerships?.filter(partnership => {
    if (!searchTerm) return true;
    
    const company = getCompanyDetails(partnership.companyId);
    return company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           company?.industry?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Table columns definition
  const columns: ColumnDef<Partnership>[] = [
    {
      accessorKey: "companyId",
      header: "Entreprise",
      cell: ({ row }) => {
        const company = getCompanyDetails(row.original.companyId);
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Building className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">{company?.name || `Entreprise ${row.original.companyId}`}</div>
              <div className="text-xs text-gray-500">{company?.industry || "Non spécifié"}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={row.original.status === "active" 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-gray-100 text-gray-800"
          }
        >
          {row.original.status === "active" ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Date de début",
      cell: ({ row }) => (
        <div>{new Date(row.original.startDate).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "website",
      header: "Site web",
      cell: ({ row }) => {
        const company = getCompanyDetails(row.original.companyId);
        return (
          <div>
            {company?.website ? (
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-600 hover:underline flex items-center"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Visiter
              </a>
            ) : (
              <span className="text-gray-500">-</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const partnership = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Contacter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusChange(partnership)}>
                {partnership.status === "active" ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Désactiver le partenariat
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activer le partenariat
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Entreprises partenaires">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <Dialog open={showAddCompanyDialog} onOpenChange={setShowAddCompanyDialog}>
          <DialogTrigger asChild>
            <Button>
              <PackagePlus className="mr-2 h-4 w-4" />
              Ajouter une entreprise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une entreprise partenaire</DialogTitle>
              <DialogDescription>
                Entrez les informations de l'entreprise pour établir un partenariat.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nom de l'entreprise</label>
                <Input 
                  id="name" 
                  placeholder="Nom de l'entreprise" 
                  value={newCompanyData.name}
                  onChange={(e) => setNewCompanyData({...newCompanyData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="website" className="text-sm font-medium">Site web</label>
                <Input 
                  id="website" 
                  placeholder="https://example.com" 
                  value={newCompanyData.website}
                  onChange={(e) => setNewCompanyData({...newCompanyData, website: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="industry" className="text-sm font-medium">Secteur d'activité</label>
                <Input 
                  id="industry" 
                  placeholder="Technologie, Finance, etc." 
                  value={newCompanyData.industry}
                  onChange={(e) => setNewCompanyData({...newCompanyData, industry: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddCompanyDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={() => createPartnershipMutation.mutate(1)} // In real app, would use actual company ID
                disabled={createPartnershipMutation.isPending}
              >
                {createPartnershipMutation.isPending ? "Création..." : "Créer le partenariat"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : filteredPartnerships && filteredPartnerships.length > 0 ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {filteredPartnerships.length} entreprise(s) partenaire(s) trouvée(s)
          </p>
          <DataTable 
            columns={columns} 
            data={filteredPartnerships} 
          />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <Building className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune entreprise partenaire</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              {searchTerm 
                ? "Aucune entreprise ne correspond à votre recherche." 
                : "Vous n'avez pas encore d'entreprises partenaires. Ajoutez-en une pour commencer."}
            </p>
            {searchTerm ? (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Réinitialiser la recherche
              </Button>
            ) : (
              <Button onClick={() => setShowAddCompanyDialog(true)}>
                <PackagePlus className="mr-2 h-4 w-4" />
                Ajouter une entreprise
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Change Confirmation Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {partnershipToUpdate?.status === "active" 
                ? "Désactiver le partenariat" 
                : "Activer le partenariat"}
            </DialogTitle>
            <DialogDescription>
              {partnershipToUpdate?.status === "active"
                ? "Êtes-vous sûr de vouloir désactiver ce partenariat ? L'entreprise ne pourra plus publier d'offres pour vos étudiants."
                : "Êtes-vous sûr de vouloir activer ce partenariat ? L'entreprise pourra publier des offres pour vos étudiants."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              disabled={updatePartnershipMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant={partnershipToUpdate?.status === "active" ? "destructive" : "default"}
              onClick={confirmStatusChange}
              disabled={updatePartnershipMutation.isPending}
            >
              {updatePartnershipMutation.isPending
                ? "Mise à jour..."
                : partnershipToUpdate?.status === "active"
                ? "Désactiver"
                : "Activer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
