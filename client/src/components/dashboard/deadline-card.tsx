import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";

interface Deadline {
  id: number;
  title: string;
  date: string;
  remainingDays: number;
  type: "interview" | "document" | "other";
}

interface DeadlineCardProps {
  deadlines: Deadline[];
  className?: string;
}

export function DeadlineCard({ deadlines, className }: DeadlineCardProps) {
  const getDeadlineIcon = (type: Deadline["type"]) => {
    switch (type) {
      case "interview":
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-red-100 flex items-center justify-center text-red-500">
            <Calendar className="h-5 w-5" />
          </div>
        );
      case "document":
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-orange-100 flex items-center justify-center text-orange-500">
            <CloudUpload className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-500">
            <Calendar className="h-5 w-5" />
          </div>
        );
    }
  };

  const getDeadlineBadge = (days: number) => {
    if (days <= 3) {
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">{days}j restants</Badge>;
    }
    if (days <= 7) {
      return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">{days}j restants</Badge>;
    }
    return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{days}j restants</Badge>;
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle>Échéances à venir</CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length > 0 ? (
          <ul className="space-y-3">
            {deadlines.map((deadline) => (
              <li key={deadline.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  {getDeadlineIcon(deadline.type)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">{deadline.title}</p>
                    <p className="text-xs text-gray-500">{deadline.date}</p>
                  </div>
                </div>
                <div>
                  {getDeadlineBadge(deadline.remainingDays)}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 py-4">
            Aucune échéance à venir
          </div>
        )}
      </CardContent>
    </Card>
  );
}
