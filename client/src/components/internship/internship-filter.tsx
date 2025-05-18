import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { CheckSquare, Filter, X } from "lucide-react";

export interface FilterValues {
  search: string;
  location: string;
  skills: string[];
  duration: [number, number]; // [min, max] in months
  status?: string;
  internshipType?: string; // "paid", "unpaid", "all"
  educationLevel?: string; // "bac", "bac+2", "bac+3", "bac+4", "bac+5", "all" 
  remoteOption?: string; // "remote", "hybrid", "onsite", "all"
}

interface InternshipFilterProps {
  onFilterChange: (filters: FilterValues) => void;
  allowStatusFilter?: boolean;
}

const SKILLS_OPTIONS = [
  "React", "Angular", "Vue", "Node.js", "Python", "Java", "PHP", 
  "JavaScript", "TypeScript", "HTML/CSS", "UI/UX", "Figma", 
  "Marketing", "Data Analysis", "Project Management"
];

export function InternshipFilter({ 
  onFilterChange, 
  allowStatusFilter = false 
}: InternshipFilterProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    location: "",
    skills: [],
    duration: [1, 12],
    status: allowStatusFilter ? "all" : undefined,
    internshipType: "all",
    educationLevel: "all",
    remoteOption: "all",
  });
  
  const [skillInput, setSkillInput] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
    onFilterChange({ ...filters, search: value });
  };

  const handleLocationChange = (value: string) => {
    setFilters({ ...filters, location: value });
  };

  const handleDurationChange = (value: [number, number]) => {
    setFilters({ ...filters, duration: value });
  };

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value });
  };
  
  const handleInternshipTypeChange = (value: string) => {
    setFilters({ ...filters, internshipType: value });
  };
  
  const handleEducationLevelChange = (value: string) => {
    setFilters({ ...filters, educationLevel: value });
  };
  
  const handleRemoteOptionChange = (value: string) => {
    setFilters({ ...filters, remoteOption: value });
  };

  const handleAddSkill = (skill: string) => {
    if (skill && !filters.skills.includes(skill)) {
      const newSkills = [...filters.skills, skill];
      setFilters({ ...filters, skills: newSkills });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const newSkills = filters.skills.filter(s => s !== skill);
    setFilters({ ...filters, skills: newSkills });
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      location: "",
      skills: [],
      duration: [1, 12],
      status: allowStatusFilter ? "all" : undefined,
      internshipType: "all",
      educationLevel: "all",
      remoteOption: "all",
    };
    
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    setSkillInput("");
  };

  const filteredSkillOptions = SKILLS_OPTIONS.filter(
    skill => skill.toLowerCase().includes(skillInput.toLowerCase()) && !filters.skills.includes(skill)
  );

  // Desktop filter component
  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Recherche</h3>
        <Input
          placeholder="Mot-clé..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Localisation</h3>
        <Input
          placeholder="Ville ou région..."
          value={filters.location}
          onChange={(e) => handleLocationChange(e.target.value)}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Compétences</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {filters.skills.map(skill => (
            <Badge key={skill} variant="secondary" className="gap-1 pl-2">
              {skill}
              <button 
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="relative">
          <Input
            placeholder="Ajouter une compétence..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
          />
          {skillInput && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredSkillOptions.length > 0 ? (
                filteredSkillOptions.map(skill => (
                  <div
                    key={skill}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAddSkill(skill)}
                  >
                    {skill}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500">Aucun résultat</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium">Durée (mois)</h3>
          <span className="text-sm text-gray-500">
            {filters.duration[0]} - {filters.duration[1]}
          </span>
        </div>
        <Slider
          defaultValue={[1, 12]}
          min={1}
          max={12}
          step={1}
          value={filters.duration}
          onValueChange={handleDurationChange as any}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Type de stage</h3>
        <Select
          value={filters.internshipType}
          onValueChange={handleInternshipTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="paid">Rémunéré</SelectItem>
            <SelectItem value="unpaid">Non rémunéré</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Niveau d'études requis</h3>
        <Select
          value={filters.educationLevel}
          onValueChange={handleEducationLevelChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tous les niveaux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            <SelectItem value="bac">Bac</SelectItem>
            <SelectItem value="bac+2">Bac+2</SelectItem>
            <SelectItem value="bac+3">Bac+3</SelectItem>
            <SelectItem value="bac+4">Bac+4</SelectItem>
            <SelectItem value="bac+5">Bac+5</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Modalité de travail</h3>
        <Select
          value={filters.remoteOption}
          onValueChange={handleRemoteOptionChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Toutes les modalités" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les modalités</SelectItem>
            <SelectItem value="onsite">Sur site</SelectItem>
            <SelectItem value="remote">Télétravail</SelectItem>
            <SelectItem value="hybrid">Hybride</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {allowStatusFilter && (
        <div>
          <h3 className="text-sm font-medium mb-2">Statut</h3>
          <Select
            value={filters.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" size="sm" onClick={handleResetFilters}>
          Réinitialiser
        </Button>
        <Button size="sm" onClick={handleApplyFilters}>
          Appliquer
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter button */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <Input
          placeholder="Rechercher..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="mr-2"
        />
        <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="h-full overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <div className="py-4 overflow-y-auto max-h-[calc(100vh-180px)]">
              <FiltersContent />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button onClick={handleApplyFilters}>Appliquer les filtres</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop filter */}
      <div className="hidden md:grid md:grid-cols-4 gap-6">
        <div className="col-span-3">
          <Input
            placeholder="Rechercher des stages par mot-clé, titre, compétence..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {(
                  filters.location || 
                  filters.skills.length > 0 || 
                  filters.duration[0] !== 1 || 
                  filters.duration[1] !== 12 || 
                  (filters.status && filters.status !== "all") ||
                  (filters.internshipType && filters.internshipType !== "all") ||
                  (filters.educationLevel && filters.educationLevel !== "all") ||
                  (filters.remoteOption && filters.remoteOption !== "all")
                ) && (
                  <Badge variant="secondary" className="ml-2">
                    <CheckSquare className="h-3 w-3 mr-1" />
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="h-full overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />
              <div className="py-4 overflow-y-auto max-h-[calc(100vh-180px)]">
                <FiltersContent />
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button onClick={handleApplyFilters}>Appliquer les filtres</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active filters */}
      {(filters.location || 
        filters.skills.length > 0 || 
        filters.duration[0] !== 1 || 
        filters.duration[1] !== 12 || 
        (filters.status && filters.status !== "all") ||
        (filters.internshipType && filters.internshipType !== "all") ||
        (filters.educationLevel && filters.educationLevel !== "all") ||
        (filters.remoteOption && filters.remoteOption !== "all")
      ) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.location && (
            <Badge variant="secondary" className="gap-1 pl-2">
              Lieu: {filters.location}
              <button
                onClick={() => {
                  const newFilters = { ...filters, location: "" };
                  setFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {(filters.duration[0] !== 1 || filters.duration[1] !== 12) && (
            <Badge variant="secondary" className="gap-1 pl-2">
              Durée: {filters.duration[0]} - {filters.duration[1]} mois
              <button
                onClick={() => {
                  const newFilters = { ...filters, duration: [1, 12] };
                  setFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.status && filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1 pl-2">
              Statut: {filters.status === "pending" ? "En attente" : filters.status === "approved" ? "Approuvé" : "Rejeté"}
              <button
                onClick={() => {
                  const newFilters = { ...filters, status: "all" };
                  setFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.internshipType && filters.internshipType !== "all" && (
            <Badge variant="secondary" className="gap-1 pl-2">
              Type: {filters.internshipType === "paid" ? "Rémunéré" : "Non rémunéré"}
              <button
                onClick={() => {
                  const newFilters = { ...filters, internshipType: "all" };
                  setFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.educationLevel && filters.educationLevel !== "all" && (
            <Badge variant="secondary" className="gap-1 pl-2">
              Niveau: {filters.educationLevel}
              <button
                onClick={() => {
                  const newFilters = { ...filters, educationLevel: "all" };
                  setFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.remoteOption && filters.remoteOption !== "all" && (
            <Badge variant="secondary" className="gap-1 pl-2">
              Modalité: {
                filters.remoteOption === "remote" ? "Télétravail" : 
                filters.remoteOption === "hybrid" ? "Hybride" : "Sur site"
              }
              <button
                onClick={() => {
                  const newFilters = { ...filters, remoteOption: "all" };
                  setFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.skills.map(skill => (
            <Badge key={skill} variant="secondary" className="gap-1 pl-2">
              {skill}
              <button 
                onClick={() => {
                  const newSkills = filters.skills.filter(s => s !== skill);
                  const newFilters = { ...filters, skills: newSkills };
                  setFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={handleResetFilters}
          >
            Réinitialiser tous les filtres
          </Button>
        </div>
      )}
    </>
  );
}
