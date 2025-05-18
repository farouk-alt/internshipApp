import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2,
  Upload,
  FileText,
  FilePlus2,
  FileCheck,
  File,
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentData {
  id: number;
  name: string;
  createdAt: string;
}

interface ShareDocumentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  companyId: number;
  companyName: string;
}

const shareDocumentsSchema = z.object({
  message: z.string().optional(),
  documentIds: z
    .array(z.number())
    .min(1, "Veuillez sélectionner au moins un document à partager"),
  documentType: z.string().optional(),
});

type ShareDocumentsForm = z.infer<typeof shareDocumentsSchema>;

export function ShareDocumentsDialog({
  isOpen,
  onClose,
  applicationId,
  companyId,
  companyName,
}: ShareDocumentsDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  // const [uploadedDocument, setUploadedDocument] = useState<{id: number, name: string, uploadedAt?: string} | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<{
    id: number;
    name: string;
    path?: string;
    uploadedAt?: string;
  } | null>(null);

  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [fileSelected, setFileSelected] = useState<boolean>(false);

  // Form definition
  const form = useForm<ShareDocumentsForm>({
    resolver: zodResolver(shareDocumentsSchema),
    defaultValues: {
      message: "",
      documentIds: [],
      documentType: "",
    },
  });

  // Clear selected documents and reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setSelectedDocuments([]);
      setUploadedFileName("");
      setFileSelected(false);
      form.reset({ message: "", documentIds: [], documentType: "" });
    }
  }, [isOpen, form]);

  // Load existing documents for the current user
  const { data: userDocuments = [], isLoading: isLoadingDocuments } = useQuery<
    DocumentData[]
  >({
    queryKey: ["/api/documents/student"],
    enabled: isOpen, // Only fetch when dialog is open
  });

  // Handle document selection
  const handleDocumentSelection = (documentId: number) => {
    const isSelected = selectedDocuments.includes(documentId);
    const newSelection = isSelected
      ? selectedDocuments.filter((id) => id !== documentId)
      : [...selectedDocuments, documentId];

    setSelectedDocuments(newSelection);
    form.setValue("documentIds", newSelection);
  };

  // Handle document upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Toujours stocker et afficher le nom du fichier immédiatement (même avant l'upload)
    const currentFileName = file.name;
    setUploadedFileName(currentFileName);
    setFileSelected(true);
    setSelectedDocuments([1]); // Utiliser un ID temporaire pour permettre la soumission
    form.setValue("documentIds", [1]); // Mise à jour du formulaire pour validation
    console.log("Nom du fichier à télécharger:", currentFileName);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "document");
    formData.append("name", currentFileName);

    try {
      setIsLoading(true);
      setUploadProgress(0);

      // Simuler une progression pour l'UX
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 0;
          if (prev >= 90) return 90;
          return prev + 10;
        });
      }, 200);

      const response = await fetch(
        "http://localhost:8080/api/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(interval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error("Échec du téléchargement");
      }

      const result = await response.json();
      console.log("✅ Uploaded document:", result);
      // setUploadedDocument({
      //   id: result.id,
      //   name: currentFileName,
      //   uploadedAt: new Date().toISOString(),
      //   path: result.path, // <= on garde le chemin ici pour l'utiliser ensuite
      // });
      console.log("Document téléchargé:", result);

      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ["/api/documents/student"] });

      toast({
        title: "Succès",
        description: "Document téléchargé avec succès: " + currentFileName,
      });

      // Automatically select the newly uploaded document
      if (result && result.id) {
        console.log("Sélection du document ID:", result.id);
        setSelectedDocuments([result.id]);
        form.setValue("documentIds", [result.id]);

        // Stocker les informations du document téléchargé pour l'affichage
        // (même si on a déjà mis à jour le nom plus haut, on garde pour la cohérence du state)
        setUploadedDocument({
          id: result.id,
          name: currentFileName,
          uploadedAt: new Date().toISOString(),
        });
      } else {
        console.error("ID du document non trouvé dans la réponse:", result);
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        title: "Erreur",
        description: "Échec du téléchargement du document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
      // Reset the input
      e.target.value = "";
    }
  };

  // Handle form submission
  const onSubmit = async (values: ShareDocumentsForm) => {
    // Vérifier qu'un fichier a été sélectionné
    if (!fileSelected || uploadedFileName === "") {
      toast({
        title: "Attention",
        description: "Veuillez télécharger un document à partager",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Attend que le document soit complètement téléchargé si nécessaire
      if (uploadProgress !== null) {
        toast({
          title: "Téléchargement en cours",
          description: "Veuillez attendre la fin du téléchargement",
        });
        // On continue quand même, le document est en cours d'upload
      }

      // S'assurer qu'il y a un ID de document
      let documentIds = values.documentIds;
      if (documentIds.length === 0) {
        documentIds = [1]; // ID temporaire pour permettre l'envoi
      }
      // Envoyer une requête de partage avec les informations du document
      // const response = await apiRequest('POST', '/api/documents/share', {
      //   applicationId,
      //   companyId,
      //   message: values.message || "Documents pour mon stage",
      //   documentIds: documentIds,
      //   documentType: values.documentType,
      //   documentName: uploadedFileName, // Ajouter le nom du fichier pour le backend
      // });

      console.log("🧾 Sharing with payload:", {
        applicationId,
        companyId,
        message: values.message || "Documents pour mon stage",
        documentIds: documentIds,
        documentType: values.documentType,
        documentName: uploadedFileName,
        documentPath: uploadedDocument?.path,
      });

     const response = await apiRequest("POST", "/api/documents/share", {
      applicationId,
      companyId,
      message: values.message || "Documents pour mon stage",
      documentIds: documentIds,
      documentType: values.documentType,
      documentName: uploadedFileName,
      documentPath: uploadedDocument?.path, // ✅ correct name
    });


      if (!response.ok) {
        throw new Error("Erreur lors du partage des documents");
      }

      // Afficher un message de succès très visible
      toast({
        title: "Documents partagés avec succès!",
        description: `Votre document "${uploadedFileName}" a été partagé avec ${companyName}`,
        variant: "default",
        duration: 5000, // Afficher plus longtemps
      });

      // Fermer le dialogue
      onClose();

      // Invalider les requêtes liées pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["/api/documents/shared"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/applications/student"],
      });
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du partage des documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Partager des documents avec {companyName}</DialogTitle>
          <DialogDescription>
            Partagez vos documents administratifs avec l'entreprise pour
            finaliser votre stage.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Télécharger un document
                </h3>

                <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-md p-4 mb-4">
                  <Input
                    type="file"
                    id="document-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />

                  {uploadProgress !== null ? (
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Téléchargement...</span>
                        <span className="text-sm">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : fileSelected ? (
                    <div className="flex flex-col items-center justify-center w-full">
                      <FileCheck className="h-10 w-10 text-green-500 mb-2" />
                      <p className="text-sm font-medium text-green-600 mb-1">
                        Document téléchargé avec succès
                      </p>

                      <div className="bg-white p-2 rounded-md border mb-3 w-full max-w-xs">
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-red-500 mt-0.5" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {uploadedFileName ||
                                "Document prêt à être partagé"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <label
                        htmlFor="document-upload"
                        className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 transition-colors text-xs"
                      >
                        <FilePlus2 className="h-3 w-3 mr-1" />
                        <span>Changer de fichier</span>
                      </label>
                    </div>
                  ) : (
                    <>
                      <FileText className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-3">
                        Ajouter un document pour votre stage
                      </p>
                      <label
                        htmlFor="document-upload"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
                      >
                        <FilePlus2 className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          Télécharger un fichier
                        </span>
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">
                  Sélectionnez le type de document
                </h3>
                <div className="space-y-3 mb-6">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div className="space-y-2">
                          <Card
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => field.onChange("convention_stage")}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-1 h-4 w-4 rounded-full flex-shrink-0 ${
                                    field.value === "convention_stage"
                                      ? "bg-blue-500"
                                      : "bg-gray-200"
                                  }`}
                                />
                                <div>
                                  <p className="font-medium">
                                    Convention de stage
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Document officiel signé par l'école
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() =>
                              field.onChange("attestation_assurance")
                            }
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-1 h-4 w-4 rounded-full flex-shrink-0 ${
                                    field.value === "attestation_assurance"
                                      ? "bg-blue-500"
                                      : "bg-gray-200"
                                  }`}
                                />
                                <div>
                                  <p className="font-medium">
                                    Attestation d'assurance
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Responsabilité civile
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => field.onChange("carte_etudiant")}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-1 h-4 w-4 rounded-full flex-shrink-0 ${
                                    field.value === "carte_etudiant"
                                      ? "bg-blue-500"
                                      : "bg-gray-200"
                                  }`}
                                />
                                <div>
                                  <p className="font-medium">
                                    Carte d'étudiant
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Copie recto-verso
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ajoutez un message pour l'entreprise..."
                          className="h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Vous pouvez ajouter des informations supplémentaires
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading || !fileSelected || !form.getValues("documentType")
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Partager les documents
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
