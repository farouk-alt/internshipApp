import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Application } from "@shared/schema";

const formSchema = z.object({
  requestType: z.string({
    required_error: "Veuillez sélectionner un type de document",
  }),
  message: z.string().min(10, {
    message: "Le message doit contenir au moins 10 caractères",
  }),
  schoolId: z.number().nullable().optional(), // Allow null for testing
  applicationId: z.number().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateDocumentRequestDialogProps {
  schoolId: number | null;
  application?: Application;
  customTrigger?: React.ReactNode;
}

export function CreateDocumentRequestDialog({
  schoolId,
  application,
  customTrigger,
}: CreateDocumentRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use fallback schoolId if null
  // const effectiveSchoolId = schoolId ?? 1; // Hardcode for testing
  // useEffect(() => {
  //   if (schoolId === null) {
  //     console.warn('schoolId is null, using fallback value: 1');
  //   }
  // }, [schoolId]);
// Initialize form
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    requestType: "",
    message: "",
    schoolId: schoolId ?? null,
    applicationId: application?.id ?? null,
  },

});

useEffect(() => {
  const fetchStudentContext = async () => {
    try {
      const response = await apiRequest("GET", "/api/student/context");
      const data = await response.json();
      console.log("student context", data);

      form.setValue("schoolId", data.schoolId);
      form.setValue("applicationId", data.latestApplicationId || null);
    } catch (err) {
      console.error("Erreur lors du chargement du contexte étudiant :", err);
    }
  };

  if (!schoolId) {
    fetchStudentContext();
  }
}, [schoolId, form]);

  // Debug form state and errors
  useEffect(() => {
    console.log('Form state:', form.getValues());
    console.log('Form errors:', form.formState.errors);
    console.log('Form isValid:', form.formState.isValid);
    if (!form.formState.isValid) {
      console.log('Submit button disabled because form is invalid');
    }
  }, [form.formState]);

  // Debug dialog open state
  useEffect(() => {
    console.log('Dialog open state:', open);
  }, [open]);

  // Mutation for creating document request
  const createDocumentRequestMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!values.schoolId) {
        throw new Error('schoolId is required for document request');
      }
      console.log('Sending POST to http://localhost:8080/api/document-requests with:', values);
      const response = await apiRequest("POST", "/api/document-requests", values);
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Mutation success:', data);
      toast({
        title: "Demande envoyée",
        description: "Votre demande de document a été envoyée avec succès",
      });
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/document-requests/student"] });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'envoi de la demande",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log('Form submitted with data:', data);
    createDocumentRequestMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {customTrigger ? (
          <button
            type="button"
            onClick={() => {
              console.log('Custom trigger clicked');
              setOpen(true);
            }}
          >
            {customTrigger}
          </button>
        ) : (
          <Button
            variant="default"
            onClick={() => console.log('Default button clicked')}
          >
            Demander un document
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Demande de document</DialogTitle>
          <DialogDescription>
            Demandez un document officiel à votre établissement. Nous vous
            informerons quand il sera disponible.
          </DialogDescription>
        </DialogHeader>

        {/* {schoolId === null && (
          <p className="text-red-500 text-sm mb-4">
            Erreur: Aucun établissement associé. Un ID temporaire (1) est utilisé.
          </p>
        )} */}
        {!form.getValues().schoolId && (
          <p className="text-yellow-600 text-sm mb-4">
            Chargement des informations de l'étudiant en cours...
          </p>
        )}


        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log('Form onSubmit triggered');
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de document</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
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
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Veuillez préciser votre demande ici..."
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormDescription>
                    Donnez des détails sur le document demandé et son utilisation prévue.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={createDocumentRequestMutation.isPending || !form.formState.isValid}
                onClick={() => console.log('Submit button clicked')}
              >
                {createDocumentRequestMutation.isPending
                  ? "Envoi en cours..."
                  : "Envoyer la demande"}
              </Button>
              {!form.formState.isValid && (
                <p className="text-sm text-red-500">
                  Formulaire invalide. Vérifiez le type de document et entrez un message d'au moins 10 caractères.
                </p>
              )}
             
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}