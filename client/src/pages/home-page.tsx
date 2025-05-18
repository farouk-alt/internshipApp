import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { UserType } from "@shared/schema";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Rediriger vers le tableau de bord approprié en fonction du type d'utilisateur
      switch (user.userType) {
        case UserType.STUDENT:
          setLocation("/student/dashboard");
          break;
        case UserType.COMPANY:
          setLocation("/company/dashboard");
          break;
        case UserType.SCHOOL:
          setLocation("/school/dashboard");
          break;
        default:
          // Type d'utilisateur non reconnu, rediriger vers la page d'authentification
          setLocation("/auth");
      }
    } else {
      // Utilisateur non authentifié, rediriger vers la page d'authentification
      setLocation("/auth");
    }
  }, [user, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}