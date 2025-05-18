import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  Loader2,
  User,
  Mail,
  Phone,
  School,
  Briefcase,
  Calendar,
  MapPin,
  Globe,
  Building,
  Info,
} from "lucide-react";
import { Redirect } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

// Interfaces pour les types de profils
interface StudentProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatar: string | null;
  phone: string | null;
  program: string | null;
  graduationYear: string | null;
  schoolId: number | null;
}

interface CompanyProfile {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  size: string | null;
  logo: string | null;
  phone: string | null;
}

interface SchoolProfile {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  address: string | null;
  website: string | null;
  logo: string | null;
  phone: string | null;
}

// Type union pour les différents profils
type ProfileData = StudentProfile | CompanyProfile | SchoolProfile;

// Schéma de validation pour le formulaire de profil étudiant
const studentProfileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom de famille est requis"),
  bio: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  program: z.string().optional().nullable(),
  graduationYear: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => (val != null ? String(val) : val)),
});


// Schéma de validation pour le formulaire de profil entreprise
const companyProfileSchema = z.object({
  name: z.string().min(1, "Le nom de l'entreprise est requis"),
  description: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

// Schéma de validation pour le formulaire de profil école
const schoolProfileSchema = z.object({
  name: z.string().min(1, "Le nom de l'école est requis"),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Rediriger vers la page de connexion si non authentifié
  if (!isLoading && !user) {
    return <Redirect to="/auth" />;
  }

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userType = user?.userType;

  // Requête pour obtenir les données du profil selon le type d'utilisateur
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error,
  } = useQuery<ProfileData>({
    queryKey: [`/api/profile/${userType?.toLowerCase()}`],
    enabled: !!user && !!userType,
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:8080/api/profile/${userType?.toLowerCase()}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Erreur lors du chargement du profil");
      return await res.json();
    },
  });

  // Définir le schéma de validation en fonction du type d'utilisateur
  let formSchema:
    | typeof studentProfileSchema
    | typeof companyProfileSchema
    | typeof schoolProfileSchema;

  switch (userType) {
    case "STUDENT":
      formSchema = studentProfileSchema;
      break;
    case "COMPANY":
      formSchema = companyProfileSchema;
      break;
    case "SCHOOL":
      formSchema = schoolProfileSchema;
      break;
    default:
      throw new Error("Unknown user type");
  }

  const form = useForm<
    | z.infer<typeof studentProfileSchema>
    | z.infer<typeof companyProfileSchema>
    | z.infer<typeof schoolProfileSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: profile || {},
  });

  // Mise à jour des valeurs par défaut lorsque le profil est chargé
  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`http://localhost:8080/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ⬅️ Important si tu utilises express-session !
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Une erreur est survenue lors de la mise à jour du profil"
        );
      }

      return await response.json();
    },
    onSuccess: (updatedData) => {
      form.reset(updatedData); // ✅ on remet les valeurs à jour dans le formulaire
      queryClient.invalidateQueries({
        queryKey: [`/api/profile/${userType?.toLowerCase()}`],
      });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès",
      });
      setIsEditing(false); // ✅ revient au mode affichage
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Soumission du formulaire
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    updateProfileMutation.mutate(data);
  };

  // Calcul du pourcentage de complétion du profil
  function calculateProfileCompleteness(
    profile: ProfileData | undefined
  ): number {
    if (!profile) return 0;

    let fieldsToCheck: string[] = [];
    let totalFields = 0;
    let completedFields = 0;

    switch (userType) {
      case "STUDENT":
        fieldsToCheck = [
          "firstName",
          "lastName",
          "bio",
          "phone",
          "program",
          "graduationYear",
        ];
        break;
      case "COMPANY":
        fieldsToCheck = [
          "name",
          "description",
          "industry",
          "location",
          "website",
          "phone",
        ];
        break;
      case "SCHOOL":
        fieldsToCheck = ["name", "description", "address", "website", "phone"];
        break;
      default:
        return 0;
    }

    totalFields = fieldsToCheck.length;
    fieldsToCheck.forEach((field) => {
      // Utiliser le type d'index pour accéder en toute sécurité aux propriétés
      const value = profile[field as keyof ProfileData];
      if (typeof value === "string" && value.trim() !== "") {
        completedFields++;
      }
    });

    return Math.round((completedFields / totalFields) * 100);
  }

  const profileCompleteness = profile
    ? calculateProfileCompleteness(profile)
    : 0;

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos informations de profil pour améliorer votre expérience sur
            Intega
          </p>
        </div>

        {isLoadingProfile ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-6">
                <p className="text-red-500 mb-2">
                  Une erreur est survenue lors du chargement du profil
                </p>
                <Button
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: [
                        `http://localhost:8080/api/profile/${userType?.toLowerCase()}`,
                      ],
                    })
                  }
                >
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Carte de profil */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Aperçu du profil</CardTitle>
                <CardDescription>
                  Informations publiques sur votre profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={
                        profile
                          ? "avatar" in profile
                            ? profile.avatar || ""
                            : profile.logo || ""
                          : ""
                      }
                    />
                    <AvatarFallback className="bg-primary-gradient text-white text-lg">
                      {userType === "STUDENT"
                        ? profile &&
                          "firstName" in profile &&
                          "lastName" in profile
                          ? `${profile.firstName?.charAt(0) || ""}${
                              profile.lastName?.charAt(0) || ""
                            }`
                          : profile?.name?.substring(0, 2) || ""
                        : profile && "name" in profile && profile.name
                        ? profile.name.substring(0, 2)
                        : ""}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {userType === "STUDENT"
                        ? profile &&
                          "firstName" in profile &&
                          "lastName" in profile
                          ? `${profile.firstName || ""} ${
                              profile.lastName || ""
                            }`
                          : ""
                        : profile && "name" in profile
                        ? profile.name || ""
                        : ""}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Complétude du profil
                    </p>
                    <Progress value={profileCompleteness} className="h-2" />
                    <p className="text-xs text-right mt-1">
                      {profileCompleteness}%
                    </p>
                  </div>

                  {!isEditing && (
                    <div className="space-y-3 mt-4">
                      {userType === "STUDENT" && (
                        <>
                          {profile?.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">{profile.phone}</span>
                            </div>
                          )}
                          {profile &&
                            "program" in profile &&
                            profile.program && (
                              <div className="flex items-center">
                                <School className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  {"program" in profile ? profile.program : ""}
                                </span>
                              </div>
                            )}
                          {profile &&
                            "graduationYear" in profile &&
                            profile.graduationYear && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  Année de diplôme: {profile.graduationYear}
                                </span>
                              </div>
                            )}
                        </>
                      )}

                      {userType === "COMPANY" && (
                        <>
                          {profile &&
                            "industry" in profile &&
                            profile.industry && (
                              <div className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  {profile.industry}
                                </span>
                              </div>
                            )}
                          {profile &&
                            "location" in profile &&
                            profile.location && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  {profile.location}
                                </span>
                              </div>
                            )}
                          {profile &&
                            "website" in profile &&
                            profile.website && (
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  {profile.website}
                                </span>
                              </div>
                            )}
                          {profile?.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">{profile.phone}</span>
                            </div>
                          )}
                        </>
                      )}

                      {userType === "SCHOOL" && (
                        <>
                          {profile &&
                            "address" in profile &&
                            profile.address && (
                              <div className="flex items-center">
                                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  {profile.address}
                                </span>
                              </div>
                            )}
                          {profile &&
                            "website" in profile &&
                            profile.website && (
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  {profile.website}
                                </span>
                              </div>
                            )}
                          {profile?.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">{profile.phone}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing
                    ? "Annuler les modifications"
                    : "Modifier le profil"}
                </Button>
              </CardFooter>
            </Card>

            {/* Formulaire d'édition */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {isEditing
                    ? "Modifier votre profil"
                    : "Informations détaillées"}
                </CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Mettez à jour vos informations personnelles"
                    : "Un profil complet augmente vos chances d'être visible"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {userType === "STUDENT" && (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Prénom</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Votre prénom"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nom</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Votre nom"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Téléphone</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Votre numéro de téléphone"
                                    type="tel"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="program"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Programme</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Votre programme d'études"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="graduationYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Année de diplôme</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Année de diplôme"
                                      type="text" // 🔁 IMPORTANT : s'assurer que c'est text, pas number
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Biographie</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Parlez-nous un peu de vous et de vos compétences"
                                    className="min-h-[120px]"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {userType === "COMPANY" && (
                        <>
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom de l'entreprise</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nom de votre entreprise"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="industry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Secteur d'activité</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ex: Technologies, Finance..."
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Localisation</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ville, Pays"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Site web</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://..."
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Téléphone</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Numéro de contact"
                                      {...field}
                                      value={field.value || ""}
                                    />
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
                                    placeholder="Décrivez votre entreprise, vos valeurs, vos activités..."
                                    className="min-h-[120px]"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {userType === "SCHOOL" && (
                        <>
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom de l'établissement</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nom de votre établissement"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Adresse</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Adresse complète"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Téléphone</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Numéro de contact"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Site web</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://..."
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Décrivez votre établissement, vos formations, vos valeurs..."
                                    className="min-h-[120px]"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            "Enregistrer les modifications"
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            updateProfileMutation.mutate({
                              firstName: "Raki",
                              lastName: "Test",
                              bio: "Ajouté depuis le test bouton",
                              phone: "0600000000",
                              program: "IA",
                              graduationYear: "2026",
                            });
                          }}
                        >
                          ⚙️ Tester la mise à jour
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    {userType === "STUDENT" && (
                      <>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium">Biographie</h3>
                            <p className="mt-1 text-gray-600">
                              {profile && "bio" in profile
                                ? profile.bio || "Aucune biographie renseignée"
                                : "Aucune biographie renseignée"}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-medium">
                              Informations académiques
                            </h3>
                            <dl className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">
                                  Programme d'études
                                </dt>
                                <dd>
                                  {profile && "program" in profile
                                    ? profile.program || "Non spécifié"
                                    : "Non spécifié"}
                                </dd>
                              </div>
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">
                                  Année de diplôme
                                </dt>
                                <dd>
                                  {profile && "graduationYear" in profile
                                    ? profile.graduationYear || "Non spécifiée"
                                    : "Non spécifiée"}
                                </dd>
                              </div>
                            </dl>
                          </div>

                          <div>
                            <h3 className="font-medium">Coordonnées</h3>
                            <dl className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">Email</dt>
                                <dd>{user?.email}</dd>
                              </div>
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">
                                  Téléphone
                                </dt>
                                <dd>{profile?.phone || "Non spécifié"}</dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </>
                    )}

                    {userType === "COMPANY" && (
                      <>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium">Description</h3>
                            <p className="mt-1 text-gray-600">
                              {profile &&
                              "description" in profile &&
                              profile.description
                                ? profile.description
                                : "Aucune description renseignée"}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-medium">
                              Informations sur l'entreprise
                            </h3>
                            <dl className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">
                                  Secteur d'activité
                                </dt>
                                <dd>
                                  {profile && "industry" in profile
                                    ? profile.industry || "Non spécifié"
                                    : "Non spécifié"}
                                </dd>
                              </div>
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">
                                  Localisation
                                </dt>
                                <dd>
                                  {profile
                                    ? "location" in profile
                                      ? profile.location || "Non spécifiée"
                                      : "Non spécifiée"
                                    : "Non spécifiée"}
                                </dd>
                              </div>
                            </dl>
                          </div>

                          <div>
                            <h3 className="font-medium">Coordonnées</h3>
                            <dl className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">Email</dt>
                                <dd>{user?.email}</dd>
                              </div>
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">
                                  Téléphone
                                </dt>
                                <dd>{profile?.phone || "Non spécifié"}</dd>
                              </div>
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">
                                  Site web
                                </dt>
                                <dd>
                                  {profile &&
                                  "website" in profile &&
                                  profile.website ? (
                                    <a
                                      href={
                                        profile.website.startsWith("http")
                                          ? profile.website
                                          : `https://${profile.website}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {profile.website}
                                    </a>
                                  ) : (
                                    "Non spécifié"
                                  )}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </>
                    )}

                    {userType === "SCHOOL" && (
                      <>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium">Description</h3>
                            <p className="mt-1 text-gray-600">
                              {profile && "description" in profile
                                ? profile.description ||
                                  "Aucune description renseignée"
                                : "Aucune description renseignée"}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-medium">Coordonnées</h3>
                            <dl className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">
                                  Adresse
                                </dt>
                                <dd>
                                  {userType === "SCHOOL" &&
                                  profile &&
                                  "address" in profile
                                    ? profile.address || "Non spécifiée"
                                    : "Non spécifiée"}
                                </dd>
                              </div>
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">Email</dt>
                                <dd>{user?.email}</dd>
                              </div>
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">
                                  Téléphone
                                </dt>
                                <dd>{profile?.phone || "Non spécifié"}</dd>
                              </div>
                              <div className="col-span-1">
                                <dt className="text-sm text-gray-500">
                                  Site web
                                </dt>
                                <dd>
                                  {profile &&
                                  "website" in profile &&
                                  profile.website ? (
                                    <a
                                      href={
                                        profile.website.startsWith("http")
                                          ? profile.website
                                          : `https://${profile.website}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {profile.website}
                                    </a>
                                  ) : (
                                    "Non spécifié"
                                  )}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <Button onClick={() => setIsEditing(true)}>
                        Modifier les informations
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
