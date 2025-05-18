import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { InternshipFilter, FilterValues } from "@/components/internship/internship-filter";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Internship } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { PlusCircle, Pencil, Eye, MoreHorizontal, Archive, ArchiveX } from "lucide-react";
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

export default function ManageInternships() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    location: "",
    skills: [],
    duration: [1, 12],
    status: "all",
  });
  const [internshipToDeactivate, setInternshipToDeactivate] = useState<Internship | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  // Fetch internships
  const { data: internships, isLoading } = useQuery<Internship[]>({
    queryKey: ["/api/internships"],
  });

  // Update internship status mutation
  const updateInternshipMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest("PUT", `http://localhost:8080/api/internships/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internships"] });
      toast({
        title: internshipToDeactivate?.isActive ? "Offre désactivée" : "Offre activée",
        description: internshipToDeactivate?.isActive 
          ? "L'offre de stage a été désactivée et n'est plus visible pour les étudiants." 
          : "L'offre de stage a été activée et est maintenant visible pour les étudiants.",
      });
      setShowDeactivateDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de l'offre.",
        variant: "destructive",
      });
    },
  });

  // Apply filters to internships
  const filteredInternships = internships?.filter((internship) => {
    // Filter by search term (title or description)
    const searchMatch =
      !filters.search ||
      internship.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (internship.description?.toLowerCase().includes(filters.search.toLowerCase()));

    // Filter by location
    const locationMatch =
      !filters.location ||
      internship.location.toLowerCase().includes(filters.location.toLowerCase());

    // Filter by skills
    const skillsMatch =
      filters.skills.length === 0 ||
      filters.skills.every((skill) => internship.skills?.includes(skill));

    // Filter by status
    const statusMatch =
      filters.status === "all" || 
      internship.status === filters.status;

    return searchMatch && locationMatch && skillsMatch && statusMatch;
  });

  // Handle deactivate internship
  const handleToggleActive = (internship: Internship) => {
    setInternshipToDeactivate(internship);
    setShowDeactivateDialog(true);
  };

  const confirmToggleActive = () => {
    if (internshipToDeactivate) {
      updateInternshipMutation.mutate({ 
        id: internshipToDeactivate.id, 
        isActive: !internshipToDeactivate.isActive 
      });
    }
  };

  // Table columns definition
  const columns: ColumnDef<Internship>[] = [
    {
      accessorKey: "title",
      header: "Titre",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-gray-500">{row.original.location}</div>
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Durée",
      cell: ({ row }) => <div>{row.original.duration}</div>,
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant="outline"
            className={`
              ${status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
              ${status === "approved" ? "bg-green-100 text-green-800 border-green-200" : ""}
              ${status === "rejected" ? "bg-red-100 text-red-800 border-red-200" : ""}
            `}
          >
            {status === "pending" && "En attente"}
            {status === "approved" && "Approuvée"}
            {status === "rejected" && "Rejetée"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Visibilité",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={row.original.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date de création",
      cell: ({ row }) => (
        <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const internship = row.original;
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
              <DropdownMenuItem onClick={() => navigate(`/company/internships/${internship.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/company/edit-internship/${internship.id}`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleToggleActive(internship)}>
                {internship.isActive ? (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <ArchiveX className="mr-2 h-4 w-4" />
                    Activer
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
    <DashboardLayout title="Gérer les offres de stage">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500">
          {isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            `${filteredInternships?.length || 0} offre(s) trouvée(s)`
          )}
        </p>
        <Button onClick={() => navigate("/company/post-internship")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvelle offre
        </Button>
      </div>

      <div className="mb-6">
        <InternshipFilter 
          onFilterChange={setFilters} 
          allowStatusFilter={true}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : filteredInternships && filteredInternships.length > 0 ? (
        <DataTable 
          columns={columns} 
          data={filteredInternships}
          searchKey="title"
          searchPlaceholder="Rechercher par titre..."
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-gray-100 rounded-full p-3 mb-4">
            <Pencil className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre trouvée</h3>
          <p className="text-gray-500 text-center max-w-md mb-4">
            Vous n'avez pas encore publié d'offres de stage ou aucune offre ne correspond à vos critères de recherche.
          </p>
          <Button onClick={() => navigate("/company/post-internship")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer une offre
          </Button>
        </div>
      )}

      {/* Confirmation Dialog for Deactivating/Activating Internship */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {internshipToDeactivate?.isActive
                ? "Désactiver l'offre de stage"
                : "Activer l'offre de stage"}
            </DialogTitle>
            <DialogDescription>
              {internshipToDeactivate?.isActive
                ? "Êtes-vous sûr de vouloir désactiver cette offre ? Elle ne sera plus visible pour les étudiants."
                : "Êtes-vous sûr de vouloir activer cette offre ? Elle sera visible pour les étudiants (sous réserve d'approbation par l'école)."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeactivateDialog(false)}
              disabled={updateInternshipMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmToggleActive}
              disabled={updateInternshipMutation.isPending}
            >
              {updateInternshipMutation.isPending
                ? "Traitement en cours..."
                : internshipToDeactivate?.isActive
                ? "Désactiver"
                : "Activer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
