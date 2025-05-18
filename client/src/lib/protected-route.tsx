import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { UserType } from "@shared/schema"; // Import de l'énumération UserType

export function ProtectedRoute({
  path,
  component: Component,
  userType,
}: {
  path: string;
  component: () => React.JSX.Element;
  userType?: typeof UserType[keyof typeof UserType];
}) {
  const { user, isLoading } = useAuth();
  
  console.log("ProtectedRoute - path:", path);
  console.log("ProtectedRoute - user:", user);
  console.log("ProtectedRoute - userType required:", userType);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // Si un type d'utilisateur spécifique est requis pour cette route
  if (userType && user.userType !== userType) {
    // Rediriger vers le dashboard approprié en fonction du type d'utilisateur
    const redirectPath = (() => {
      switch (user.userType) {
        case UserType.STUDENT:
          return "/student/dashboard";
        case UserType.COMPANY:
          return "/company/dashboard";
        case UserType.SCHOOL:
          return "/school/dashboard";
        default:
          return "/";
      }
    })();
    
    console.log("Redirecting to:", redirectPath);
    
    return (
      <Route path={path}>
        <Redirect to={redirectPath} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
