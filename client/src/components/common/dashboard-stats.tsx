import { 
  Layers, 
  CheckCircleIcon, 
  ClockIcon, 
  FileTextIcon 
} from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";

interface DashboardStatsProps {
  stats: {
    applications: number;
    accepted: number;
    pending: number;
    documents: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <DashboardCard
        title="Candidatures"
        value={stats.applications.toString()}
        icon={<Layers className="h-5 w-5 text-primary-600" />}
        iconClassName="bg-primary-100"
      />
      
      <DashboardCard
        title="Acceptées"
        value={stats.accepted.toString()}
        icon={<CheckCircleIcon className="h-5 w-5 text-green-600" />}
        iconClassName="bg-green-100"
      />
      
      <DashboardCard
        title="En attente"
        value={stats.pending.toString()}
        icon={<ClockIcon className="h-5 w-5 text-yellow-600" />}
        iconClassName="bg-yellow-100"
      />
      
      <DashboardCard
        title="Documents"
        value={stats.documents.toString()}
        icon={<FileTextIcon className="h-5 w-5 text-purple-600" />}
        iconClassName="bg-purple-100"
      />
    </div>
  );
}
