import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Student } from "@shared/schema";
import { 
  UserPlus, 
  Search, 
  FileText, 
  History, 
  MoreHorizontal, 
  Mail, 
  Briefcase 
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
} from "@/components/ui/card";

export default function ManageStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);

  // Fetch students
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/school/students"],
  });

  // Get unique programs for filter
  const uniquePrograms = Array.from(new Set(students?.map(student => student.program).filter(Boolean)));
  
  // Get unique years for filter
  const uniqueYears = Array.from(new Set(students?.map(student => student.graduationYear).filter(Boolean)));

  // Filter students
  const filteredStudents = students?.filter(student => {
    // Filter by search term
    const searchMatch = !searchTerm || 
      (student.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by program
    const programMatch = programFilter === "all" || student.program === programFilter;
    
    // Filter by year
    const yearMatch = yearFilter === "all" || student.graduationYear?.toString() === yearFilter;
    
    return searchMatch && programMatch && yearMatch;
  });

  // Table columns definition
  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium">
              {row.original.firstName?.[0]}{row.original.lastName?.[0]}
            </span>
          </div>
          <div>
            <div className="font-medium">{`${row.original.firstName} ${row.original.lastName}`}</div>
            <div className="text-xs text-gray-500">{row.original.program}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "graduationYear",
      header: "Année",
      cell: ({ row }) => <div>{row.original.graduationYear || "-"}</div>,
    },
    {
      accessorKey: "progress",
      header: "Progression",
      cell: ({ row }) => {
        // This would be from actual data in a real app
        const hasInternship = Math.random() > 0.5;
        return (
          <div>
            <Badge
              variant="outline"
              className={`${hasInternship ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
            >
              {hasInternship ? "Stage trouvé" : "En recherche"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "applications",
      header: "Candidatures",
      cell: ({ row }) => <div>3</div>, // This would be from actual data in a real app
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const student = row.original;
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
                <FileText className="mr-2 h-4 w-4" />
                Voir le profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Briefcase className="mr-2 h-4 w-4" />
                Voir les candidatures
              </DropdownMenuItem>
              <DropdownMenuItem>
                <History className="mr-2 h-4 w-4" />
                Historique des stages
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Contacter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Gestion des étudiants">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
          <div className="flex gap-2">
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Programme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les programmes</SelectItem>
                {uniquePrograms.map((program) => (
                  <SelectItem key={program} value={program}>{program}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {uniqueYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un étudiant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel étudiant</DialogTitle>
              <DialogDescription>
                Entrez les informations de l'étudiant pour l'ajouter à votre école.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* This would be a form in a real application */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">Prénom</label>
                  <Input id="firstName" placeholder="Prénom" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Nom</label>
                  <Input id="lastName" placeholder="Nom" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="program" className="text-sm font-medium">Programme</label>
                  <Input id="program" placeholder="Programme d'études" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="graduationYear" className="text-sm font-medium">Année de diplôme</label>
                  <Input id="graduationYear" type="number" placeholder="2024" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddStudentDialog(false)}>
                Annuler
              </Button>
              <Button>Ajouter l'étudiant</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : filteredStudents && filteredStudents.length > 0 ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {filteredStudents.length} étudiant(s) trouvé(s)
          </p>
          <DataTable 
            columns={columns} 
            data={filteredStudents} 
          />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <UserPlus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun étudiant trouvé</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              {searchTerm || programFilter !== "all" || yearFilter !== "all" 
                ? "Aucun étudiant ne correspond à vos critères de recherche." 
                : "Vous n'avez pas encore ajouté d'étudiants à votre école."}
            </p>
            {searchTerm || programFilter !== "all" || yearFilter !== "all" ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setProgramFilter("all");
                  setYearFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            ) : (
              <Button onClick={() => setShowAddStudentDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter votre premier étudiant
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
