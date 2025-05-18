import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { X } from "lucide-react";

// Create schema for form validation
const internshipFormSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  location: z.string().min(2, "La localisation est requise"),
  duration: z.string().min(2, "La durée est requise"),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

type InternshipFormValues = z.infer<typeof internshipFormSchema>;

interface InternshipFormProps {
  onSubmit: (data: InternshipFormValues) => void;
  defaultValues?: Partial<InternshipFormValues>;
  isLoading?: boolean;
}

export function InternshipForm({ 
  onSubmit, 
  defaultValues,
  isLoading = false 
}: InternshipFormProps) {
  const [skillInput, setSkillInput] = useState("");
  
  const form = useForm<InternshipFormValues>({
    resolver: zodResolver(internshipFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      location: defaultValues?.location || "",
      duration: defaultValues?.duration || "",
      requirements: defaultValues?.requirements || "",
      responsibilities: defaultValues?.responsibilities || "",
      skills: defaultValues?.skills || [],
    },
  });
  
  const handleFormSubmit = (data: InternshipFormValues) => {
    onSubmit(data);
  };
  
  const handleAddSkill = () => {
    if (skillInput && !form.getValues().skills?.includes(skillInput)) {
      const currentSkills = form.getValues().skills || [];
      form.setValue("skills", [...currentSkills, skillInput]);
      setSkillInput("");
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
    const currentSkills = form.getValues().skills || [];
    form.setValue(
      "skills", 
      currentSkills.filter(s => s !== skill)
    );
  };
  
  const handleSkillInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du stage</FormLabel>
              <FormControl>
                <Input placeholder="ex: Développeur Full Stack Junior" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localisation</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Paris, France" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée</FormLabel>
                <FormControl>
                  <Input placeholder="ex: 6 mois" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Décrivez le stage en détail..."
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prérequis</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Niveau d'études, expérience, etc."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="responsibilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsabilités</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Détaillez les tâches et responsabilités..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="skills"
          render={() => (
            <FormItem>
              <FormLabel>Compétences requises</FormLabel>
              <div className="flex space-x-2">
                <Input
                  placeholder="Ajouter une compétence (ex: React)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillInputKeyDown}
                />
                <Button type="button" onClick={handleAddSkill}>
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.getValues().skills?.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 pl-2">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Chargement..." : defaultValues ? "Mettre à jour l'offre" : "Publier l'offre"}
        </Button>
      </form>
    </Form>
  );
}
