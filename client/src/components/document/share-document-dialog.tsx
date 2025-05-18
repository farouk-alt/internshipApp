import { useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DocumentRequest } from "@shared/schema";
import { Upload } from "lucide-react";

// Définition du schéma de validation pour le formulaire
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du fichier doit contenir au moins 2 caractères.",
  }),
  documentType: z.string().min(1, {
    message: "Le type de document est requis.",
  }),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ShareDocumentDialogProps {
  userIdToShareWith: number;
  documentRequestId?: number;
  applicationId?: number;
  trigger?: ReactNode;
  onShareSuccess?: () => void;
}

export function ShareDocumentDialog({
  userIdToShareWith,
  documentRequestId,
  applicationId,
  trigger,
  onShareSuccess
}: ShareDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer la demande de document si un ID est fourni
  const { data: documentRequest } = useQuery<DocumentRequest>({
    queryKey: ["/api/document-requests", documentRequestId],
    enabled: !!documentRequestId,
  });

  // Configuration de react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      documentType: documentRequest?.requestType || "",
      message: "",
    },
  });

  // Configuration de la gestion de fichiers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      // Mettre à jour le nom du formulaire avec le nom du fichier
      const fileName = file.name.split(".")[0]; // Retirer l'extension
      form.setValue("name", fileName);
    }
  };

  // Mutation pour partager un document
  const shareDocumentMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!selectedFile) {
        throw new Error("Aucun fichier sélectionné");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", values.name);
      formData.append("type", values.documentType);
      formData.append("sharedWithUserId", userIdToShareWith.toString());
      
      if (values.message) {
        formData.append("message", values.message);
      }
      
      if (documentRequestId) {
        formData.append("documentRequestId", documentRequestId.toString());
      }
      
      if (applicationId) {
        formData.append("applicationId", applicationId.toString());
      }

      // Afficher les données de FormData pour déboguer
      console.log('Contenu du FormData:');
      for (const pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Simuler une progression de téléchargement (pour l'interface)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 100);

      try {
        const response = await fetch("http://localhost:8080/api/documents/share", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erreur API:", errorData);
          throw new Error(errorData.message || "Erreur lors du partage du document");
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
        
        return await response.json();
      } catch (error) {
        console.error("Erreur dans la mutation:", error);
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Document partagé",
        description: "Le document a été partagé avec succès",
      });
      
      // Fermer le dialogue
      setOpen(false);
      
      // Réinitialiser le formulaire et l'état
      form.reset();
      setSelectedFile(null);
      setUploadProgress(0);
      
      // Invalider les requêtes pour forcer un rafraîchissement des données
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      if (documentRequestId) {
        queryClient.invalidateQueries({ queryKey: ["/api/document-requests"] });
      }
      
      // Appeler le callback de succès si fourni
      if (onShareSuccess) {
        onShareSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Réinitialiser le formulaire quand la demande de document change
  useEffect(() => {
    if (documentRequest) {
      form.setValue("documentType", documentRequest.requestType);
    }
  }, [documentRequest, form]);

  // Gestion de la soumission du formulaire
  function onSubmit(data: FormValues) {
    if (!selectedFile) {
      toast({
        title: "Fichier manquant",
        description: "Veuillez sélectionner un fichier à partager",
        variant: "destructive",
      });
      return;
    }
    
    shareDocumentMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="default">Partager un document</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Partager un document</DialogTitle>
          <DialogDescription>
            Téléchargez et partagez un document avec l'utilisateur.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Zone de dépôt de fichier */}
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary/50">
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                {selectedFile ? (
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">
                      Cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF, Word, Images (max. 10MB)
                    </p>
                  </div>
                )}
                <Input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="w-full">
                  <Button type="button" variant="outline" className="mt-2 w-full">
                    Sélectionner un fichier
                  </Button>
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du document</FormLabel>
                  <FormControl>
                    <Input placeholder="Convention de stage" {...field} />
                  </FormControl>
                  <FormDescription>
                    Donnez un nom au document qui sera partagé.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de document</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type de document" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="convention_stage">Convention de stage</SelectItem>
                      <SelectItem value="attestation_scolarite">Attestation de scolarité</SelectItem>
                      <SelectItem value="attestation_reussite">Attestation de réussite</SelectItem>
                      <SelectItem value="releve_notes">Relevé de notes</SelectItem>
                      <SelectItem value="autre">Autre document</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Message accompagnant le document..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground text-right">
                  {uploadProgress === 100 ? "Terminé" : `${uploadProgress}%`}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  shareDocumentMutation.isPending || !selectedFile || uploadProgress > 0
                }
              >
                {shareDocumentMutation.isPending
                  ? "Partage en cours..."
                  : "Partager le document"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}