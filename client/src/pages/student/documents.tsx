import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FileUploader } from "@/components/ui/file-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Document } from "@shared/schema";
import { FileText, FileX, Download, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function StudentDocuments() {
  const [activeTab, setActiveTab] = useState("all");
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey:["/api/documents"],
  });

  // Create document mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; metadata: { name: string; type: string } }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("name", data.metadata.name);
      formData.append("type", data.metadata.type);
      
      const response = await fetch("http://localhost:8080/api/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload document");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey:["/api/documents"] });
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest("DELETE", `http://localhost:8080/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey:["/api/documents"] });
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès.",
      });
      setShowDeleteDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de suppression",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle file upload
  const handleUpload = async (file: File, metadata: { name: string; type: string }) => {
    await uploadMutation.mutate({ file, metadata });
  };

  // Handle document delete
  const handleDelete = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete.id);
    }
  };

  // Filter documents based on active tab
  const filteredDocuments = documents?.filter((doc) => {
    if (activeTab === "all") return true;
    return doc.type === activeTab;
  });

  // Get document icon
  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case "cv":
        return <FileText className="h-6 w-6 text-blue-500" />;
      case "motivationLetter":
        return <FileText className="h-6 w-6 text-green-500" />;
      case "schoolForm":
        return <FileText className="h-6 w-6 text-purple-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout title="Mes documents">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="cv">CV</TabsTrigger>
              <TabsTrigger value="motivationLetter">Lettres de motivation</TabsTrigger>
              <TabsTrigger value="schoolForm">Documents école</TabsTrigger>
              <TabsTrigger value="other">Autres</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array(4).fill(0).map((_, index) => (
                    <Skeleton key={index} className="w-full h-32 rounded-lg" />
                  ))}
                </div>
              ) : filteredDocuments && filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredDocuments.map((document) => (
                    <Card key={document.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            {getDocumentIcon(document.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {document.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Ajouté le {new Date(document.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(document)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileX className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
                  <p className="text-gray-500 max-w-md mb-4">
                    {activeTab === "all" 
                      ? "Vous n'avez pas encore téléchargé de documents." 
                      : `Vous n'avez pas de documents de type "${
                          activeTab === "cv" ? "CV" : 
                          activeTab === "motivationLetter" ? "lettre de motivation" : 
                          activeTab === "schoolForm" ? "document école" : "autre"
                        }".`}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Ajouter un document</h3>
              <div className="space-y-4">
                <FileUploader
                  onUpload={handleUpload}
                  allowedTypes={[".pdf", ".doc", ".docx", ".txt"]}
                  maxSizeMB={5}
                  documentType="cv"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le document "{documentToDelete?.name}"? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
