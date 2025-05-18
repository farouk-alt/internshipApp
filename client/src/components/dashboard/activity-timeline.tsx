import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CheckCircle, Layers, File, MessageSquare } from "lucide-react";

interface Activity {
  id: number;
  type: "application" | "document" | "interview" | "message";
  title: string;
  time: string;
  relatedEntity?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  className?: string;
}

export function ActivityTimeline({ activities, className }: ActivityTimelineProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "application":
        return (
          <Avatar className="h-8 w-8 bg-blue-500">
            <AvatarFallback className="bg-blue-500 text-white">
              <Layers className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        );
      case "interview":
        return (
          <Avatar className="h-8 w-8 bg-primary-600">
            <AvatarFallback className="bg-primary-600 text-white">
              <CheckCircle className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        );
      case "document":
        return (
          <Avatar className="h-8 w-8 bg-green-500">
            <AvatarFallback className="bg-green-500 text-white">
              <File className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        );
      case "message":
        return (
          <Avatar className="h-8 w-8 bg-purple-500">
            <AvatarFallback className="bg-purple-500 text-white">
              <MessageSquare className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <li key={activity.id} className="flex items-start space-x-3">
                {getActivityIcon(activity.type)}
                <div>
                  <p className="text-sm text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-500 py-4">
              Aucune activité récente
            </li>
          )}
        </ul>
        {activities.length > 0 && (
          <div className="mt-4 text-center">
            <a href="#activities" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Voir toute l'activité
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
