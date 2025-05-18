import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Globe, MapPin, Building, Users, FileText, ExternalLink } from "lucide-react";

interface Company {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  size: string | null;
  logo: string | null;
  email: string;
  activeInternships: number;
  totalInternships: number;
  internships: {
    id: number;
    title: string;
    status: string | null;
    isActive: boolean | null;
  }[];
}

export default function CompanyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: company, isLoading, error } = useQuery<Company>({
    queryKey: [`/api/companies/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil de l'entreprise",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleInternshipClick = (internshipId: number) => {
    navigate(`/student/internships/${internshipId}`);
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Profil de l'entreprise">
        {renderSkeleton()}
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout title="Profil de l'entreprise">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Building className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Entreprise non trouvée</h3>
          <p className="text-gray-500 max-w-md mb-4">
            Nous n'avons pas pu trouver l'entreprise demandée. Elle a peut-être été supprimée ou déplacée.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/student/internships")}
          >
            Retour aux offres de stage
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Profil de ${company.name}`}>
      <div className="space-y-6">
        {/* En-tête avec logo et nom de l'entreprise */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="h-24 w-24">
            {company.logo ? (
              <AvatarImage src={company.logo} alt={`Logo de ${company.name}`} />
            ) : (
              <AvatarFallback className="bg-primary-gradient text-white text-2xl">
                {company.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">{company.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              {company.industry && (
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  {company.industry}
                </Badge>
              )}
              {company.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{company.location}</span>
                </div>
              )}
              {company.size && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{company.size}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations et offres en cours */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>À propos de l'entreprise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.description ? (
                <p className="text-gray-700">{company.description}</p>
              ) : (
                <p className="text-gray-500 italic">Aucune description fournie par l'entreprise.</p>
              )}

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-md font-medium mb-3">Coordonnées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{company.email}</p>
                  </div>
                  {company.website && (
                    <div>
                      <p className="text-sm text-gray-500">Site web</p>
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        {company.website}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Offres actives</p>
                  <p className="text-xl font-bold">{company.activeInternships}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Total des stages</p>
                  <p className="text-xl font-bold">{company.totalInternships}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Offres de stage actuelles */}
        <Card>
          <CardHeader>
            <CardTitle>Offres de stage en cours</CardTitle>
          </CardHeader>
          <CardContent>
            {company.internships.filter(internship => internship.isActive).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {company.internships
                  .filter(internship => internship.isActive)
                  .map(internship => (
                    <Card 
                      key={internship.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleInternshipClick(internship.id)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium text-gray-900">{internship.title}</h3>
                        <Badge variant="outline" className="mt-2 bg-green-50 text-green-800 border-green-200">
                          Actif
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Aucune offre de stage active actuellement</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}