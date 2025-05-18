import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ApplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  internshipId: number;
  internshipTitle: string;
}

export function ApplyDialog({ isOpen, onClose, internshipId, internshipTitle }: ApplyDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!cvFile) {
      toast({
        title: "CV obligatoire",
        description: "Veuillez télécharger votre CV pour postuler.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("internshipId", internshipId.toString());
      formData.append("coverLetter", coverLetter);
      formData.append("cv", cvFile);
      
      const response = await fetch("http://localhost:8080/api/applications", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de la candidature");
      }
      
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été envoyée avec succès !",
      });
      
      // Invalider les requêtes pour rafraîchir les données côté étudiant et entreprise
      queryClient.invalidateQueries({ queryKey: ["/api/applications/student"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/company"] });
      
      // Réinitialiser et fermer
      setCoverLetter("");
      setCvFile(null);
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre candidature.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Postuler à l'offre : {internshipTitle}</DialogTitle>
          <DialogDescription>
            Complétez votre candidature en joignant votre CV et une lettre de motivation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cv">CV (obligatoire)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files && setCvFile(e.target.files[0])}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Formats acceptés : PDF, DOC, DOCX
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Lettre de motivation (optionnelle)</Label>
              <Textarea
                id="coverLetter"
                placeholder="Expliquez pourquoi vous êtes intéressé(e) par ce stage..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Envoyer ma candidature
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}