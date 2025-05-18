import { ReactNode } from "react";
import { Sidebar } from "@/components/common/sidebar";
import { Header } from "@/components/common/header";
import { FileText } from "lucide-react";
import { IntegaLogo } from "@/components/ui/intega-logo";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  showLogo?: boolean;
  icon?: ReactNode;
}

export function DashboardLayout({ 
  children, 
  title, 
  showLogo = false,
  icon
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {title && (
            <div className="mb-6 flex items-center">
              {showLogo && <IntegaLogo />}
              {icon && <div className="mr-3">{icon}</div>}
              <h1 className="text-2xl font-bold text-gray-800 font-heading">{title}</h1>
            </div>
          )}
          
          <div className="pb-20"> {/* Ajout d'espace en bas pour éviter que le contenu ne soit caché */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
