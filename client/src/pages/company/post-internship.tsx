import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { InternshipForm } from "@/components/internship/internship-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface FormData {
  title: string;
  description: string;
  location: string;
  duration: string;
  requirements?: string;
  responsibilities?: string;
  skills?: string[];
}

export default function PostInternship() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Create internship mutation
  const createInternshipMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/internships", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internships"] });
      setShowSuccessMessage(true);
      toast({
        title: "Offre publiée",
        description: "Votre offre de stage a été publiée avec succès.",
      });
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/company/manage-internships");
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de l'offre.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: FormData) => {
    createInternshipMutation.mutate(data);
  };

  return (
    <DashboardLayout title="Publier une offre de stage">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate("/company/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Button>
        
        {showSuccessMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Offre de stage publiée avec succès !</AlertTitle>
            <AlertDescription className="text-green-700">
              Votre offre est maintenant visible pour les étudiants (sous réserve d'approbation par l'école).
              Vous allez être redirigé vers la page de gestion des offres...
            </AlertDescription>
          </Alert>
        )}
        
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Information importante</AlertTitle>
          <AlertDescription>
            Votre offre de stage sera soumise à l'approbation de l'école avant d'être visible pour les étudiants.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardContent className="pt-6">
            <InternshipForm 
              onSubmit={handleSubmit}
              isLoading={createInternshipMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
