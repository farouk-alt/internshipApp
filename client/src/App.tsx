import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { UserType } from "@shared/schema";
import CompanyProfilePage from "@/pages/company-profile";
import axios from "axios";

// Student pages
import StudentDashboard from "@/pages/student/dashboard";
import StudentInternships from "@/pages/student/internships";
import StudentApplications from "@/pages/student/applications";
import StudentDocumentsPage from "@/pages/student/documents-page";
import StudentMessages from "@/pages/student/messages";

// Company pages
import CompanyDashboard from "@/pages/company/dashboard";
import PostInternship from "@/pages/company/post-internship";
import ManageInternships from "@/pages/company/manage-internships";
import Applicants from "@/pages/company/applicants";
import CompanyMessages from "@/pages/company/messages";

// School pages
import SchoolDashboard from "@/pages/school/dashboard";
import ManageStudents from "@/pages/school/manage-students";
import ManageCompanies from "@/pages/school/manage-companies";
import ValidateOffers from "@/pages/school/validate-offers";
import SchoolMessages from "@/pages/school/messages";

// Messaging
import MessagingPage from "@/pages/messaging-page";

// Profile page (commune à tous les types d'utilisateurs)
import ProfilePage from "@/pages/profile";
axios.defaults.withCredentials = true;



function Router() {
  
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Routes communes */}
      <ProtectedRoute path="/" component={HomePage} />
      
      {/* Student routes */}
      <ProtectedRoute path="/student/dashboard" component={StudentDashboard} userType={UserType.STUDENT} />
      <ProtectedRoute path="/student/internships" component={StudentInternships} userType={UserType.STUDENT} />
      <ProtectedRoute path="/student/applications" component={StudentApplications} userType={UserType.STUDENT} />
      <ProtectedRoute path="/student/documents" component={StudentDocumentsPage} userType={UserType.STUDENT} />
      <ProtectedRoute path="/student/messages" component={StudentMessages} userType={UserType.STUDENT} />
      
      {/* Company routes */}
      <ProtectedRoute path="/company/dashboard" component={CompanyDashboard} userType={UserType.COMPANY} />
      <ProtectedRoute path="/company/post-internship" component={PostInternship} userType={UserType.COMPANY} />
      <ProtectedRoute path="/company/manage-internships" component={ManageInternships} userType={UserType.COMPANY} />
      <ProtectedRoute path="/company/applicants" component={Applicants} userType={UserType.COMPANY} />
      <ProtectedRoute path="/company/messages" component={CompanyMessages} userType={UserType.COMPANY} />
      
      {/* School routes */}
      <ProtectedRoute path="/school/dashboard" component={SchoolDashboard} userType={UserType.SCHOOL} />
      <ProtectedRoute path="/school/manage-students" component={ManageStudents} userType={UserType.SCHOOL} />
      <ProtectedRoute path="/school/manage-companies" component={ManageCompanies} userType={UserType.SCHOOL} />
      <ProtectedRoute path="/school/validate-offers" component={ValidateOffers} userType={UserType.SCHOOL} />
      <ProtectedRoute path="/school/messages" component={SchoolMessages} userType={UserType.SCHOOL} />
      
      {/* Messaging route (accessible par tous les utilisateurs authentifiés) */}
      <ProtectedRoute path="/messaging" component={MessagingPage} />
      
      {/* Profile route (accessible par tous les utilisateurs authentifiés) */}
      <ProtectedRoute path="/profile" component={ProfilePage} />
      
      {/* Company profile route (public, viewable by any authenticated user) */}
      <ProtectedRoute path="/company-profile/:id" component={CompanyProfilePage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster position="top-right" richColors closeButton />
          <AuthProvider>
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;