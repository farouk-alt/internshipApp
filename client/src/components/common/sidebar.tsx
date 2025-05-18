import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { UserType } from "@shared/schema";
import {
  Home,
  Briefcase,
  ClipboardList,
  FileText,
  History,
  MessageSquare,
  PlusCircle,
  Users,
  CheckCircle,
  Building,
  GraduationCap,
  ChartLine,
  FileUp,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  FolderOpen,
} from "lucide-react";

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const studentLinks: SidebarLink[] = [
  { href: "/student/dashboard", label: "Tableau de bord", icon: <Home size={20} /> },
  { href: "/student/internships", label: "Offres de stage", icon: <Briefcase size={20} /> },
  { href: "/student/applications", label: "Mes candidatures", icon: <ClipboardList size={20} /> },
  { href: "/student/documents", label: "Mes documents", icon: <FileText size={20} /> },
  { href: "/student/history", label: "Historique de stages", icon: <History size={20} /> },
  { href: "/student/messages", label: "Messages", icon: <MessageSquare size={20} /> },
];

const companyLinks: SidebarLink[] = [
  { href: "/company/dashboard", label: "Tableau de bord", icon: <Home size={20} /> },
  { href: "/company/post-internship", label: "Publier une offre", icon: <PlusCircle size={20} /> },
  { href: "/company/manage-internships", label: "Gérer les offres", icon: <ClipboardList size={20} /> },
  { href: "/company/applicants", label: "Candidats", icon: <Users size={20} /> },
  { href: "/company/student-documents", label: "Documents étudiants", icon: <FolderOpen size={20} /> },
  { href: "/company/messages", label: "Messages", icon: <MessageSquare size={20} /> },
];

const schoolLinks: SidebarLink[] = [
  { href: "/school/dashboard", label: "Tableau de bord", icon: <Home size={20} /> },
  { href: "/school/manage-students", label: "Gérer les étudiants", icon: <GraduationCap size={20} /> },
  { href: "/school/manage-companies", label: "Entreprises partenaires", icon: <Building size={20} /> },
  { href: "/school/validate-offers", label: "Valider les offres", icon: <CheckCircle size={20} /> },
  { href: "/school/student-tracking", label: "Suivi des étudiants", icon: <ChartLine size={20} /> },
  { href: "/school/documents", label: "Documents école", icon: <FileUp size={20} /> },
  { href: "/school/messages", label: "Messages", icon: <MessageSquare size={20} /> },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [links, setLinks] = useState<SidebarLink[]>(studentLinks);

  useEffect(() => {
    if (user) {
      switch (user.userType) {
        case UserType.STUDENT:
          setLinks(studentLinks);
          break;
        case UserType.COMPANY:
          setLinks(companyLinks);
          break;
        case UserType.SCHOOL:
          setLinks(schoolLinks);
          break;
      }
    }
  }, [user]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="relative h-8 w-8 mr-2">
              <div className="absolute inset-0 rounded-md bg-primary-500"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">I</div>
            </div>
            <span className="text-gray-900 text-xl font-bold font-heading">Intega</span>
          </div>
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-800"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div className="px-3 py-2 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span>{user?.userType === "STUDENT" ? "Espace Étudiant" : 
                   user?.userType === "COMPANY" ? "Espace Entreprise" : 
                   user?.userType === "SCHOOL" ? "Espace École" : "Navigation"}</span>
          </div>

          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all",
                location === link.href 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <span className={cn(
                "mr-3 flex-shrink-0",
                location === link.href 
                  ? "text-primary" 
                  : "text-gray-500 group-hover:text-gray-700"
              )}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}

          <div className="pt-6 mt-6 border-t border-gray-200">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Paramètres du compte
            </div>
            <Link 
              href="/profile"
              className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
            >
              <User size={20} className="mr-3 text-gray-500 group-hover:text-gray-700" />
              Profil
            </Link>
            <Link 
              href="/settings"
              className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
            >
              <Settings size={20} className="mr-3 text-gray-500 group-hover:text-gray-700" />
              Paramètres
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2.5 mt-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-3" />
              Déconnexion
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
