import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Internship } from "@shared/schema";
import { Building, MapPin, Clock, Loader2, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

interface InternshipCardProps {
  internship: Internship;
  company?: {
    id?: number;
    name: string;
  };
  onApply?: (internshipId: number) => void;
  onOpenApplyDialog?: (internshipId: number, internshipTitle: string) => void;
  showApplyButton?: boolean;
}

export function InternshipCard({
  internship,
  company,
  onApply,
  onOpenApplyDialog,
  showApplyButton = true,
}: InternshipCardProps) {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = () => {
    navigate(`/student/internships/${internship.id}`);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Empêcher les clics multiples
    if (isSubmitting) return;
    
    // Si onOpenApplyDialog est défini, ouvrir le dialogue au lieu de postuler directement
    if (onOpenApplyDialog) {
      onOpenApplyDialog(internship.id, internship.title);
      return;
    }
    
    // Sinon, utiliser l'ancien système (pour rétrocompatibilité)
    if (onApply) {
      setIsSubmitting(true);
      
      // Appeler onApply et réinitialiser l'état après 1 seconde (pour l'UX)
      onApply(internship.id);
      
      // Réinitialiser l'état après un délai (pour une meilleure UX)
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    if (diff < 7) return `Il y a ${diff} jours`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="border border-gray-200 hover:bg-gray-50 transition duration-150 cursor-pointer" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between">
          <div>
            <h3 className="text-md font-medium text-gray-800">{internship.title}</h3>
            <div className="flex items-center mt-1">
              <Building className="h-4 w-4 text-gray-400" />
              {company?.id ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className="ml-1 text-sm text-gray-600 hover:text-blue-600 hover:underline flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigate(`/company-profile/${company.id}`);
                        }}
                      >
                        {company.name || "Entreprise"}
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Voir le profil de l&apos;entreprise</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="ml-1 text-sm text-gray-600">{company?.name || "Entreprise"}</span>
              )}
              <MapPin className="h-4 w-4 text-gray-400 ml-3" />
              <span className="ml-1 text-sm text-gray-600">{internship.location}</span>
            </div>
            <div className="mt-2 flex flex-wrap">
              {internship.skills?.map((skill, index) => (
                <Badge key={index} variant="outline" className="mr-2 mb-2 bg-blue-50 text-blue-800 border-blue-200">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-3 sm:mt-0 flex flex-col items-start sm:items-end">
            <span className="text-sm font-medium text-gray-600">{internship.duration}</span>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>
                {internship.createdAt instanceof Date
                  ? formatDate(internship.createdAt)
                  : internship.createdAt
                    ? formatDate(new Date(internship.createdAt))
                    : "Date inconnue"}
              </span>
            </div>
            {showApplyButton && (
              <Button 
                className="mt-3" 
                size="sm"
                onClick={handleApply}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    En cours...
                  </>
                ) : "Postuler"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
