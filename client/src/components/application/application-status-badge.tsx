import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ApplicationStatus = "pending" | "accepted" | "rejected" | "interviewing" | "reviewing";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function ApplicationStatusBadge({
  status,
  className,
}: ApplicationStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          label: "En attente",
          variant: "yellow",
        };
      case "accepted":
        return {
          label: "Acceptée",
          variant: "green",
        };
      case "rejected":
        return {
          label: "Refusée",
          variant: "red",
        };
      case "interviewing":
        return {
          label: "Entretien",
          variant: "blue",
        };
      case "reviewing":
        return {
          label: "En révision",
          variant: "blue",
        };
      default:
        return {
          label: "Inconnu",
          variant: "gray",
        };
    }
  };

  const { label, variant } = getStatusConfig();

  const getVariantClasses = () => {
    switch (variant) {
      case "green":
        return "bg-green-100 text-green-800 border-green-200";
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "red":
        return "bg-red-100 text-red-800 border-red-200";
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge variant="outline" className={cn(getVariantClasses(), className)}>
      {label}
    </Badge>
  );
}
