import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FileText, FileUp, Folder, FileCheck, Clock, FileQuestion } from "lucide-react";
import { DocumentRequestsList } from "@/components/document-request/document-requests-list";
import { SharedDocumentsList } from "@/components/document-request/shared-documents-list";
import { CreateDocumentRequestDialog } from "@/components/document-request/create-document-request-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const documentTypes = [
  { 
    id: "convention_stage", 
    name: "Convention de stage", 
    description: "Document officiel requis pour valider votre stage auprès de l'entreprise d'accueil.",
    icon: <FileText className="h-8 w-8 text-blue-500" />,
    badge: "Populaire"
  },
  { 
    id: "attestation_scolarite", 
    name: "Attestation de scolarité", 
    description: "Justificatif prouvant votre inscription au sein de l'établissement.",
    icon: <FileCheck className="h-8 w-8 text-green-500" />,
    badge: null
  },
  { 
    id: "attestation_reussite", 
    name: "Attestation de réussite", 
    description: "Document confirmant la validation de votre année académique ou diplôme.",
    icon: <FileCheck className="h-8 w-8 text-purple-500" />,
    badge: null
  },
  { 
    id: "releve_notes", 
    name: "Relevé de notes", 
    description: "Document présentant l'ensemble de vos résultats académiques.",
    icon: <FileText className="h-8 w-8 text-amber-500" />,
    badge: null
  },
  { 
    id: "autre", 
    name: "Autre document", 
    description: "Demandez tout autre document spécifique dont vous auriez besoin.",
    icon: <FileQuestion className="h-8 w-8 text-gray-500" />,
    badge: null
  }
];

export default function StudentDocumentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  interface StudentProfile {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    schoolId: number;
  }

  const { data: student, isLoading: isLoadingStudent, error: studentError } = useQuery<StudentProfile>({
    queryKey: ["studentProfile"],
    queryFn: async () => {
      console.log('Fetching student profile from http://localhost:8080/api/profile');
      const response = await fetch('http://localhost:8080/api/profile', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch student profile');
      }
      return response.json();
    },
    enabled: !!user && user.userType === "STUDENT",
  });

  useEffect(() => {
    console.log('Student data:', student);
    if (studentError) {
      console.error('Student profile error:', studentError.message);
    }
  }, [student, studentError]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["dashboard", "shared", "requests"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url.toString());
  };

  const handleSelectDocType = (docType: string) => {
    setSelectedDocType(docType);
  };

  if (isLoadingStudent) {
    return (
      <DashboardLayout 
        title="Gestion des Documents" 
        showLogo={true}
        icon={<FileText className="h-8 w-8 text-blue-500 p-1.5 bg-blue-100 rounded-md" />}
      >
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-slate-200 h-16 w-16 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-24 mb-2.5"></div>
            <div className="h-2 bg-slate-200 rounded w-32"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (studentError) {
    return (
      <DashboardLayout 
        title="Gestion des Documents" 
        showLogo={true}
        icon={<FileText className="h-8 w-8 text-blue-500 p-1.5 bg-blue-100 rounded-md" />}
      >
        <div className="text-center text-red-500">
          Erreur lors du chargement du profil: {studentError.message}
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout 
        title="Gestion des Documents" 
        showLogo={true}
        icon={<FileText className="h-8 w-8 text-blue-500 p-1.5 bg-blue-100 rounded-md" />}
      >
        <div className="text-center text-red-500">
          Profil étudiant non trouvé. Veuillez vous reconnecter.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Gestion des Documents" 
      showLogo={true}
      icon={<FileText className="h-8 w-8 text-blue-500 p-1.5 bg-blue-100 rounded-md" />}
    >
      <div className="mb-6">
        <Tabs
          defaultValue="dashboard"
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <TabsList className="mb-2">
              <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
              <TabsTrigger value="shared">Documents partagés</TabsTrigger>
              <TabsTrigger value="requests">Mes demandes</TabsTrigger>
            </TabsList>
            
            {student && activeTab !== "dashboard" && (
              <CreateDocumentRequestDialog 
                schoolId={student.schoolId}
                customTrigger={
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => console.log('Top-right button clicked')}
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Demander un document
                  </Button>
                }
              />
            )}
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Folder className="mr-2 h-5 w-5 text-primary" />
                    Documents administratifs disponibles
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez le type de document que vous souhaitez demander à votre établissement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documentTypes.map((docType) => (
                      <Card 
                        key={docType.id} 
                        className={`border-2 cursor-pointer transition-all ${
                          selectedDocType === docType.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleSelectDocType(docType.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-primary/10 rounded-md">
                              {docType.icon}
                            </div>
                            {docType.badge && (
                              <Badge variant="secondary" className="ml-auto">
                                {docType.badge}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <h3 className="font-medium text-lg mb-1">{docType.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {docType.description}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-1">
                          {student && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <CreateDocumentRequestDialog 
                                schoolId={student.schoolId} 
                                customTrigger={
                                  <Button 
                                    size="sm" 
                                    variant={selectedDocType === docType.id ? "default" : "outline"}
                                    className="w-full"
                                    onClick={() => console.log(`Document type button clicked: ${docType.id}`)}
                                  >
                                    Demander ce document
                                  </Button>
                                }
                              />
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-amber-500" />
                      Demandes récentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {student && (
                      <div className="max-h-[300px] overflow-y-auto">
                        <DocumentRequestsList 
                          schoolId={student.schoolId} 
                          limit={3} 
                          compact={true} 
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleTabChange("requests")}>
                      Voir toutes mes demandes
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-blue-500" />
                      Documents partagés récents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[300px] overflow-y-auto">
                      <SharedDocumentsList compact={true} limit={3} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleTabChange("shared")}>
                      Voir tous mes documents
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shared">
            <Card>
              <CardContent className="pt-6">
                <SharedDocumentsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardContent className="pt-6">
                {student && <DocumentRequestsList schoolId={student.schoolId} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="md:hidden fixed bottom-5 right-5">
        {student && (
          <CreateDocumentRequestDialog
            schoolId={student.schoolId} 
            customTrigger={
              <Button 
                size="lg" 
                className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
                onClick={() => console.log('Floating button clicked')}
              >
                <FileUp className="h-6 w-6" />
              </Button>
            } 
          />
        )}
      </div>
    </DashboardLayout>
  );
}