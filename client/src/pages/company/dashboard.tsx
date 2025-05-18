import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import {
  LayoutDashboard,
  Briefcase,
  UserPlus,
  FileCheck2,
  Settings,
  LogOut,
  Bell,
  School,
  BellRing,
  ChevronRight,
  Filter,
  Plus,
  FileText,
  CheckCircle,
  Send,
  Download,
  Users,
  Building2,
  Search,
  MessageSquare,
  User,
  Clock as CalendarClock,
  X,
  Edit,
  Upload,
  AlertCircle,
  Info,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { IntegaLogo } from "@/components/ui/intega-logo";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function CompanyDashboard() {
  const { user, userProfile, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [unreadCount, setUnreadCount] = useState(2);
  const [showPublishInternship, setShowPublishInternship] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [applicationFilterType, setApplicationFilterType] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showSchoolDetails, setShowSchoolDetails] = useState(false);
  const [showAddPartnershipModal, setShowAddPartnershipModal] = useState(false);
  const [partnershipFormData, setPartnershipFormData] = useState({
    schoolId: "1",
    startDate: "",
    endDate: "",
    status: "active",
    messageContent: "",
  });
  const [availableSchools, setAvailableSchools] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  type SharedDoc = { document_id: string | number; name: string; path: string };
  const [sharedDocs, setSharedDocs] = useState<SharedDoc[]>([]);
  useEffect(() => {
    const fetchSharedDocs = async () => {
      if (selectedApplication?.id) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/applications/${selectedApplication.id}/shared-documents`
          );
          setSharedDocs(response.data.documents);
        } catch (err) {
          console.error("Erreur chargement documents partagés:", err);
        }
      }
    };

    fetchSharedDocs();
  }, [selectedApplication]);

  // État du formulaire pour l'offre de stage
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    duration: "",
    description: "",
    requirements: "",
    responsibilities: "",
    isActive: true,
  });

  // État du formulaire pour la modification du profil
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    industry: "",
    location: "",
    description: "",
    website: "",
    size: "",
  });

  // Gestion des changements dans le formulaire d'offre
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Gestion des changements dans le formulaire de profil
  const handleProfileFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Gestion des changements dans le formulaire de partenariat
  const handlePartnershipFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setPartnershipFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Fonction pour demander un partenariat ou envoyer un message à l'école
  const requestPartnership = async () => {
    try {
      console.log(
        "Envoi de message/demande de partenariat:",
        partnershipFormData
      );
      toast({
        title: "Message envoyé",
        description:
          "Votre message a été envoyé à l'école ENSA Tanger. Vous serez contacté prochainement.",
      });
      setPartnershipFormData({
        schoolId: "1",
        startDate: "",
        endDate: "",
        status: "active",
        messageContent: "",
      });
      setShowAddPartnershipModal(false);
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description:
          error.message || "Une erreur est survenue lors de l'envoi du message",
        variant: "destructive",
      });
    }
  };

  // Effect pour remplir le formulaire lors de l'édition d'une offre
  useEffect(() => {
    if (selectedInternship) {
      setFormData({
        title: selectedInternship.title || "",
        location: selectedInternship.location || "",
        duration: selectedInternship.duration || "",
        description: selectedInternship.description || "",
        requirements: selectedInternship.requirements || "",
        responsibilities: selectedInternship.responsibilities || "",
        isActive: selectedInternship.isActive === false ? false : true,
      });
    }
  }, [selectedInternship]);

  // Effect pour remplir le formulaire de profil
  useEffect(() => {
    if (showEditProfile && userProfile) {
      setProfileFormData({
        name: userProfile.name || "",
        industry: userProfile.industry || "",
        location: userProfile.location || "",
        description: userProfile.description || "",
        website: userProfile.website || "",
        size: userProfile.size || "",
      });
    }
  }, [showEditProfile, userProfile]);

  // Validation function for internship data
  const isValidInternship = (data: typeof formData): boolean => {
    const requiredFields = [
      "title",
      "location",
      "duration",
      "description",
      "requirements",
      "responsibilities",
    ];
    return requiredFields.every(
      (field) =>
        data[field] && data[field].trim() !== "" && !/^w+$/.test(data[field]) // Prevent placeholder values like 'wwww...'
    );
  };

  // Function to handle internship creation/editing
  const handlePublishInternship = async () => {
    const companyId = userProfile?.id || (await getCompanyProfile())?.id;

    console.log(companyId);

    if (!companyId) {
      toast({
        title: "Erreur",
        description:
          "Profil d'entreprise introuvable. Veuillez compléter votre profil.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidInternship(formData)) {
      toast({
        title: "Entrée invalide",
        description:
          "Veuillez fournir des valeurs valides pour tous les champs du stage.",
        variant: "destructive",
      });
      return;
    }

    const internshipData = {
      ...formData,
      companyId,
    };

    try {
      const method = selectedInternship ? "PUT" : "POST";
      const url = selectedInternship
        ? `http://localhost:8080/api/internships/${selectedInternship.id}`
        : "http://localhost:8080/api/internships";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(internshipData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Échec de l'enregistrement du stage"
        );
      }

      await refetchInternships();
      toast({
        title: "Succès",
        description: `Stage ${
          selectedInternship ? "mis à jour" : "créé"
        } avec succès.`,
      });
      setShowPublishInternship(false);
      setSelectedInternship(null);
      setFormData({
        title: "",
        location: "",
        duration: "",
        description: "",
        requirements: "",
        responsibilities: "",
        isActive: true,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error.message ||
          "Une erreur est survenue lors de l'enregistrement du stage.",
        variant: "destructive",
      });
    }
  };

  // Récupérer et afficher les offres de stages actives
  const {
    data: internshipData,
    isLoading: internshipLoading,
    refetch: refetchInternships,
  } = useQuery({
    queryKey: ["/api/internships/company"],
    queryFn: async () => {
      try {
        const companyId =
          userProfile?.id || (await getCompanyProfile())?.id || 0;
        if (!companyId) {
          console.error("Aucun ID d'entreprise disponible");
          return { internships: [] };
        }
        const res = await fetch(
          `http://localhost:8080/api/internships/company/${companyId}`
        );
        if (!res.ok) return { internships: [] };
        const data = await res.json();
        // Filter out internships with undefined companyId
        const validInternships = data.internships.filter(
          (internship: any) => internship.companyId === companyId
        );
        return { internships: validInternships };
      } catch (e) {
        console.error("Erreur lors de la récupération des stages:", e);
        return { internships: [] };
      }
    },
    enabled: !!user?.id,
  });

  // Fonction pour récupérer le profil de l'entreprise si nécessaire
  async function getCompanyProfile() {
    if (!user) return null;
    try {
      const res = await fetch(
        `http://localhost:8080/api/companies/user/${user.id}`
      );
      if (res.ok) {
        const data = await res.json();
        return data;
      }
      return null;
    } catch (e) {
      console.error(
        "Erreur lors de la récupération du profil d'entreprise:",
        e
      );
      return null;
    }
  }

  // Récupérer et afficher les candidatures reçues
  const {
    data: applicationData,
    isLoading: applicationLoading,
    refetch: refetchApplications,
  } = useQuery({
    queryKey: ["/api/applications/company"],
    queryFn: async () => {
      try {
        const companyId =
          userProfile?.id || (await getCompanyProfile())?.id || 0;
        if (!companyId) {
          console.log(
            "Aucun ID d'entreprise disponible pour récupérer les candidatures"
          );
          return { applications: [] };
        }
        console.log(
          "Récupération des candidatures pour l'entreprise ID:",
          companyId
        );
        const res = await fetch(
          `http://localhost:8080/api/applications/company/${companyId}`
        );
        if (!res.ok) {
          console.error(
            "Erreur lors de la récupération des candidatures:",
            res.status,
            res.statusText
          );
          return { applications: [] };
        }
        const data = await res.json();
        console.log("Données candidatures récupérées:", data);
        return data;
      } catch (e) {
        console.error("Erreur lors de la récupération des candidatures:", e);
        return { applications: [] };
      }
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Mutation pour mettre à jour le statut d'une candidature
  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(
        `http://localhost:8080/api/applications/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
          credentials: "include",
        }
      );
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Erreur inconnue" }));
        throw new Error(
          errorData.message || "Échec de la mise à jour du statut"
        );
      }
      return await res.json();
    },
    onSuccess: () => {
      refetchApplications();
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la candidature a été mis à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description:
          error.message ||
          "Une erreur est survenue lors de la mise à jour du statut",
        variant: "destructive",
      });
    },
  });

  // Filtrer les candidatures selon le type sélectionné
  interface Application {
    id: number;
    createdAt: string;
    status: "pending" | "reviewing" | "accepted" | "rejected";
    student?: { firstName: string; lastName: string };
    internship?: { title: string };
  }

  const filteredApplications = useMemo(() => {
    if (!applicationData?.applications?.length) return [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return applicationData.applications.filter((app: Application) => {
      switch (applicationFilterType) {
        case "new":
          const createdAt = new Date(app.createdAt);
          return createdAt >= sevenDaysAgo && app.status === "pending";
        case "inprogress":
          return app.status === "reviewing";
        case "accepted":
          return app.status === "accepted";
        case "rejected":
          return app.status === "rejected";
        case "all":
        default:
          return true;
      }
    });
  }, [applicationData, applicationFilterType]);

  // Récupérer et afficher l'historique des stages
  const {
    data: internshipHistoryData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["/api/internship-history/company", internshipData],
    queryFn: async () => {
      try {
        console.log(
          "Récupération de l'historique des stages avec stages actifs:",
          internshipData
        );
        const companyId =
          userProfile?.id || (await getCompanyProfile())?.id || 0;
        const res = await fetch(
          `http://localhost:8080/api/internship-history/company/${companyId}`
        );
        const historyData = !res.ok ? { histories: [] } : await res.json();
        const inactiveInternships =
          internshipData?.internships?.filter(
            (i: any) => i.isActive === false
          ) || [];
        console.log(
          "Stages inactifs trouvés:",
          inactiveInternships.length,
          inactiveInternships
        );
        const inactiveAsHistory = inactiveInternships.map(
          (internship: any) => ({
            id: `inactive-${internship.id}`,
            title: internship.title,
            location: internship.location,
            duration: internship.duration,
            description: internship.description,
            startDate: internship.createdAt,
            endDate: null,
            studentName: null,
            status: "inactif",
          })
        );
        const result = {
          histories: [...historyData.histories, ...inactiveAsHistory],
        };
        console.log("Résultat final de l'historique:", result);
        return result;
      } catch (e) {
        console.error(
          "Erreur lors de la récupération de l'historique des stages:",
          e
        );
        return { histories: [] };
      }
    },
    enabled: !!user?.id && !!internshipData,
    refetchOnWindowFocus: true,
  });

  // Debug logs
  useEffect(() => {
    console.log("Company Dashboard - User data:", user);
    console.log("Company Dashboard - User profile data:", userProfile);
    console.log("Company Dashboard - User type:", user?.userType);
    console.log(
      "Company Dashboard - Is user COMPANY:",
      user?.userType === "COMPANY"
    );
    console.log("Company Dashboard - Internship data:", internshipData);
    console.log("Company Dashboard - Application data:", applicationData);
    console.log(
      "Company Dashboard - Internship History data:",
      internshipHistoryData
    );
  }, [
    user,
    userProfile,
    internshipData,
    applicationData,
    internshipHistoryData,
  ]);

  // Construire le profil avec les données disponibles
  const companyProfile = {
    name: userProfile?.name || user?.username || "Mon Entreprise",
    logo: userProfile?.logo || null,
    industry: userProfile?.industry || "Non spécifié",
    location: userProfile?.location || "Non spécifié",
    activeInternships:
      internshipData?.internships?.filter((i: any) => i.isActive)?.length || 0,
    totalApplications: applicationData?.applications?.length || 0,
    completedProfile: userProfile
      ? (Object.values(userProfile).filter((v) => v !== null && v !== undefined)
          .length /
          Object.keys(userProfile).length) *
        100
      : 50,
  };

  // Mock data for stats
  const companyStats = {
    totalInterns: 12,
    averageDuration: 4.5,
    satisfactionRate: 88,
    offersThisMonth: 3,
  };

  // Chargement des écoles partenaires depuis l'API
  const {
    data: partnershipsData,
    isLoading: partnershipsLoading,
    refetch: refetchPartnerships,
  } = useQuery({
    queryKey: ["/api/partnerships"],
    queryFn: async () => {
      try {
        const companyId =
          userProfile?.id || (await getCompanyProfile())?.id || 0;
        console.log(
          "Récupération des partenariats pour l'entreprise",
          companyId
        );
        const res = await fetch(`http://localhost:8080/api/partnerships`);
        if (!res.ok) return { partnerships: [] };
        const data = await res.json();
        console.log("Données des partenariats:", data);
        return data;
      } catch (e) {
        console.error("Erreur lors de la récupération des partenariats:", e);
        return { partnerships: [] };
      }
    },
    enabled: !!user?.id,
  });

  // École administrateur qui gère la plateforme
  const adminSchool = {
    id: 1,
    name: "ENSA Tanger",
    description:
      "École Nationale des Sciences Appliquées de Tanger - École centrale d'administration de la plateforme Intega qui gère et valide les offres de stage",
    logo: "/assets/ensa-tanger-logo.png",
    website: "www.ensat.ac.ma",
    address: "Tanger, Maroc",
    phone: "+212 539 393 744",
  };

  // Données des écoles partenaires
  const partnerSchools = [
    {
      id: 1,
      name: "ENSA Tanger",
      students: 1240,
      programs: 8,
      partnership: "École Administrateur",
      description:
        "École Nationale des Sciences Appliquées de Tanger - École centrale d'administration de la plateforme Intega qui gère et valide les offres de stage",
    },
  ];

  // Mock data for notifications
  const mockNotifications = [
    {
      id: 1,
      title: "Nouvelle candidature reçue",
      from: "Jean Dupont",
      time: "il y a 1 heure",
      read: false,
    },
    {
      id: 2,
      title: "Document reçu",
      from: "Marie Martin",
      time: "il y a 3 heures",
      read: false,
    },
    {
      id: 3,
      title: "Rappel: Entretien programmé",
      from: "Système",
      time: "il y a 1 jour",
      read: true,
    },
  ];

  const [notifications, setNotifications] = useState(mockNotifications);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast({
      title: "Notifications lues",
      description: "Toutes les notifications ont été marquées comme lues",
    });
  };

  // Fonction pour gérer le changement de fichier
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    }
  };

  // Mettre à jour les données du formulaire de profil lorsque userProfile change
  useEffect(() => {
    if (userProfile) {
      setProfileFormData({
        name: userProfile.name || "",
        description: userProfile.description || "",
        industry: userProfile.industry || "",
        location: userProfile.location || "",
        website: userProfile.website || "",
        size: userProfile.size || "",
      });
    }
  }, [userProfile]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const updateCompanyProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/companies/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(profileFormData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la mise à jour du profil"
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profil mis à jour",
        description: "Votre profil d'entreprise a été mis à jour avec succès",
      });
      setShowEditProfile(false);
    } catch (error: any) {
      console.error("Erreur de mise à jour du profil:", error);
      toast({
        title: "Erreur",
        description:
          error.message ||
          "Une erreur est survenue lors de la mise à jour du profil",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner un fichier image pour votre logo",
        variant: "destructive",
      });
      return;
    }
    setIsLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      const response = await fetch("http://localhost:8080/api/companies/logo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'upload du logo");
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Logo ajouté",
        description: "Votre logo a été téléchargé avec succès",
      });
      setLogoFile(null);
      setShowLogoUpload(false);
    } catch (error: any) {
      console.error("Erreur d'upload du logo:", error);
      toast({
        title: "Erreur",
        description:
          error.message ||
          "Une erreur est survenue lors du téléchargement du logo",
        variant: "destructive",
      });
    } finally {
      setIsLogoUploading(false);
    }
  };

  useEffect(() => {
    document.title = "Tableau de bord entreprise - Intega";
  }, []);

  console.log("Docs partagés:", sharedDocs);
  console.log("Application sélectionnée:", selectedApplication);


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b flex-shrink-0">
          <div className="flex items-center">
            <IntegaLogo />
            <h1 className="text-xl font-bold text-gray-900">Intega</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Avatar className="h-10 w-10 mr-3">
                {companyProfile.logo ? (
                  <AvatarImage
                    src={companyProfile.logo}
                    alt={`Logo de ${companyProfile.name}`}
                  />
                ) : (
                  <AvatarFallback className="bg-primary-gradient text-white">
                    {companyProfile.name.substring(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 truncate max-w-[140px]">
                  {companyProfile.name}
                </p>
                <p className="text-sm text-gray-500">Entreprise</p>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                type="button"
                className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === "overview"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Vue d'ensemble
              </button>

              <button
                type="button"
                className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === "internships"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("internships")}
              >
                <Briefcase className="h-5 w-5 mr-3" />
                Offres de stages
              </button>

              <button
                type="button"
                className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === "applications"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("applications")}
              >
                <UserPlus className="h-5 w-5 mr-3" />
                Candidatures
              </button>

              <button
                type="button"
                className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === "schools"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("schools")}
              >
                <School className="h-5 w-5 mr-3" />
                Écoles partenaires
              </button>

              <button
                type="button"
                className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === "history"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("history")}
              >
                <CalendarClock className="h-5 w-5 mr-3" />
                Historique des stages
              </button>

              <Button
                variant="ghost"
                className="inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-accent hover:text-accent-foreground rounded-md"
                asChild
              >
                <a href="/messaging">
                  <MessageSquare className="h-5 w-5 mr-3" />
                  Messagerie
                </a>
              </Button>

              <div className="relative">
                <button
                  type="button"
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    activeTab === "notifications"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="h-5 w-5 mr-3" />
                  Notifications
                </button>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <div className="absolute top-2 left-7 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
                  </div>
                )}
              </div>

              <button
                type="button"
                className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === "profile"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <Building2 className="h-5 w-5 mr-3" />
                Profil entreprise
              </button>

              <button
                type="button"
                className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === "settings"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-5 w-5 mr-3" />
                Paramètres
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-auto p-4 border-t">
          <button
            type="button"
            className="inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main content container */}
      <div className={`flex-1 ${sidebarOpen ? "lg:pl-64" : ""}`}>
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </Button>

          <div className="flex items-center">
            <IntegaLogo />
            <h1 className="text-xl font-bold text-gray-900">Intega</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="relative p-1"
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.filter((n) => !n.read).length}
                </div>
              )}
            </button>

            <Avatar className="h-8 w-8">
              {companyProfile.logo ? (
                <AvatarImage
                  src={companyProfile.logo}
                  alt={`Logo de ${companyProfile.name}`}
                />
              ) : (
                <AvatarFallback className="bg-primary-gradient text-white text-sm">
                  {companyProfile.name.substring(0, 2)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>

        {/* Main content */}
        <main className="p-4 lg:p-8 overflow-y-auto">
          {/* Vue d'ensemble */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Vue d'ensemble
                </h1>
                <div className="flex items-center">
                  <p className="text-sm text-gray-500 mr-2">
                    Aujourd'hui: {new Date().toLocaleDateString()}
                  </p>
                  <Button
                    className="ml-4 bg-primary-gradient hover:bg-blue-700 text-white"
                    size="sm"
                    onClick={() => setShowPublishInternship(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Publier une offre
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Stages actifs
                        </p>
                        <h3 className="text-2xl font-bold mt-1 text-gray-900">
                          {companyProfile.activeInternships}
                        </h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Briefcase className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Candidatures reçues
                        </p>
                        <h3 className="text-2xl font-bold mt-1 text-gray-900">
                          {companyProfile.totalApplications}
                        </h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <UserPlus className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Taux d'acceptation
                        </p>
                        <h3 className="text-2xl font-bold mt-1 text-gray-900">
                          {applicationData?.applications?.length > 0
                            ? Math.round(
                                (applicationData.applications.filter(
                                  (a: any) => a.status === "accepted"
                                ).length /
                                  applicationData.applications.length) *
                                  100
                              )
                            : 0}
                          %
                        </h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Profil complété
                        </p>
                        <h3 className="text-2xl font-bold mt-1 text-gray-900">
                          {Math.round(companyProfile.completedProfile)}%
                        </h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <Building2 className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">
                        Offres de stages récentes
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("internships")}
                      >
                        Voir tout
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {internshipLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">
                          Chargement des offres...
                        </p>
                      </div>
                    ) : internshipData?.internships?.length ? (
                      <div className="space-y-3">
                        {internshipData.internships
                          .slice(0, 3)
                          .map((internship: any) => (
                            <div
                              key={internship.id}
                              className="flex items-start p-3 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <div className="h-10 w-10 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                                <Briefcase size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {internship.title}
                                  </h4>
                                  <Badge
                                    variant={
                                      internship.isActive
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {internship.isActive ? "Actif" : "Inactif"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                  {internship.location}
                                </p>
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <UserPlus size={14} className="mr-1" />
                                  <span>
                                    {internship.applications?.length || 0}{" "}
                                    candidatures
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto">
                          <Briefcase className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="mt-2 text-base font-medium text-gray-900">
                          Aucune offre de stage
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Commencez par publier votre première offre de stage.
                        </p>
                        <Button
                          className="mt-3 bg-primary-gradient"
                          size="sm"
                          onClick={() => setShowPublishInternship(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Publier une offre
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">
                        Candidatures récentes
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("applications")}
                      >
                        Voir tout
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {applicationLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">
                          Chargement des candidatures...
                        </p>
                      </div>
                    ) : applicationData?.applications?.length ? (
                      <div className="space-y-3">
                        {applicationData.applications
                          .slice(0, 3)
                          .map((application: any) => (
                            <div
                              key={application.id}
                              className="flex items-start p-3 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowApplicationDetails(true);
                              }}
                            >
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback className="bg-primary-gradient text-white">
                                  {application.student?.firstName?.charAt(0) ||
                                    "?"}
                                  {application.student?.lastName?.charAt(0) ||
                                    "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {application.student?.firstName}{" "}
                                    {application.student?.lastName}
                                  </h4>
                                  <Badge
                                    variant={
                                      application.status === "accepted"
                                        ? "default"
                                        : application.status === "rejected"
                                        ? "destructive"
                                        : application.status === "reviewing"
                                        ? "secondary"
                                        : "outline"
                                    }
                                  >
                                    {application.status === "accepted" &&
                                      "Accepté"}
                                    {application.status === "rejected" &&
                                      "Refusé"}
                                    {application.status === "reviewing" &&
                                      "En cours"}
                                    {application.status === "pending" &&
                                      "En attente"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                  Candidature pour:{" "}
                                  {application.internship?.title ||
                                    "Stage inconnu"}
                                </p>
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <CalendarClock size={14} className="mr-1" />
                                  <span>
                                    {new Date(
                                      application.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto">
                          <UserPlus className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="mt-2 text-base font-medium text-gray-900">
                          Aucune candidature
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Vous recevrez ici les candidatures pour vos offres de
                          stage.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Compléter votre profil</CardTitle>
                  <CardDescription>
                    Un profil complet augmente la visibilité de votre entreprise
                    auprès des étudiants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          Progression du profil
                        </span>
                        <span className="text-sm text-gray-500">
                          {Math.round(companyProfile.completedProfile)}%
                        </span>
                      </div>
                      <Progress
                        value={companyProfile.completedProfile}
                        className="h-2"
                      />
                    </div>

                    {companyProfile.logo === null && (
                      <div className="bg-blue-50 text-blue-600 p-3 rounded-md flex items-start">
                        <div className="rounded-full bg-blue-100 p-1 mr-3 flex-shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-2">
                            Ajoutez le logo de votre entreprise
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setShowLogoUpload(true)}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Ajouter un logo
                          </Button>
                        </div>
                      </div>
                    )}

                    {!userProfile?.industry && (
                      <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-start">
                        <div className="rounded-full bg-green-100 p-1 mr-3 flex-shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-2">
                            Complétez les informations de votre entreprise
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setShowEditProfile(true)}
                          >
                            <Building2 className="h-3 w-3 mr-1" />
                            Compléter le profil
                          </Button>
                        </div>
                      </div>
                    )}

                    {internshipData?.internships?.length === 0 && (
                      <div className="bg-purple-50 text-purple-600 p-3 rounded-md flex items-start">
                        <div className="rounded-full bg-purple-100 p-1 mr-3 flex-shrink-0">
                          <Briefcase size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-2">
                            Publiez votre première offre de stage
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setShowPublishInternship(true)}
                          >
                            <Briefcase className="h-3 w-3 mr-1" />
                            Publier une offre
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profil Entreprise */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Profil Entreprise
                </h1>
                <Button
                  className="bg-primary-gradient hover:bg-blue-700 text-white"
                  onClick={() => setShowEditProfile(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Modifier le profil
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Informations de base</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-4">
                        {companyProfile.logo ? (
                          <AvatarImage
                            src={companyProfile.logo}
                            alt={`Logo de ${companyProfile.name}`}
                          />
                        ) : (
                          <AvatarFallback className="bg-primary-gradient text-white text-2xl">
                            {companyProfile.name.substring(0, 2)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <h2 className="text-xl font-semibold text-center">
                        {companyProfile.name}
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowLogoUpload(true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {companyProfile.logo
                          ? "Modifier le logo"
                          : "Ajouter un logo"}
                      </Button>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Industrie</p>
                          <p className="font-medium">
                            {companyProfile.industry}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Emplacement</p>
                          <p className="font-medium">
                            {companyProfile.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">
                        Complétude du profil
                      </p>
                      <div className="flex items-center justify-between mb-1">
                        <Progress
                          value={companyProfile.completedProfile}
                          className="h-2"
                        />
                        <span className="text-sm font-medium text-gray-700 ml-2">
                          {Math.round(companyProfile.completedProfile)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Détails de l'entreprise</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-md font-medium mb-2">Description</h3>
                      <p className="text-gray-700">
                        {userProfile?.description ||
                          "Aucune description fournie. Ajoutez une description pour aider les étudiants à mieux connaître votre entreprise."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-md font-medium mb-3">Coordonnées</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{user?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Site web</p>
                          <p className="font-medium">
                            {userProfile?.website || "Non spécifié"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Taille de l'entreprise
                          </p>
                          <p className="font-medium">
                            {userProfile?.size || "Non spécifiée"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-md font-medium mb-3">Statistiques</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">
                            Offres actives
                          </p>
                          <p className="text-xl font-bold">
                            {companyProfile.activeInternships}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">Candidatures</p>
                          <p className="text-xl font-bold">
                            {companyProfile.totalApplications}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">
                            Stages pourvus
                          </p>
                          <p className="text-xl font-bold">
                            {applicationData?.applications?.filter(
                              (app: any) => app.status === "accepted"
                            ).length || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">
                            Taux d'acceptation
                          </p>
                          <p className="text-xl font-bold">
                            {applicationData?.applications?.length > 0
                              ? Math.round(
                                  (applicationData.applications.filter(
                                    (a: any) => a.status === "accepted"
                                  ).length /
                                    applicationData.applications.length) *
                                    100
                                )
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Offres de stage */}
          {activeTab === "internships" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestion des offres de stage
                </h1>
                <Button
                  className="bg-primary-gradient hover:bg-blue-700 text-white"
                  onClick={() => {
                    setSelectedInternship(null);
                    setShowPublishInternship(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Publier une offre
                </Button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Rechercher une offre..."
                        className="pl-9"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="active">Actifs</SelectItem>
                          <SelectItem value="inactive">Inactifs</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {internshipLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-500">
                      Chargement des offres de stage...
                    </p>
                  </div>
                ) : internshipData?.internships?.length ? (
                  <div className="divide-y">
                    {internshipData.internships.map((internship: any) => (
                      <div
                        key={internship.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                              <Briefcase size={24} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-medium text-gray-900">
                                {internship.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <svg
                                    className="h-3 w-3 mr-1 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {internship.location}
                                </span>
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <svg
                                    className="h-3 w-3 mr-1 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {internship.duration}
                                </span>
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <svg
                                    className="h-3 w-3 mr-1 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                  </svg>
                                  {internship.applications?.length || 0}{" "}
                                  candidat(s)
                                </span>
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <svg
                                    className="h-3 w-3 mr-1 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {new Date(
                                    internship.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-auto">
                            <Badge
                              variant={
                                internship.isActive ? "default" : "secondary"
                              }
                            >
                              {internship.isActive ? "Actif" : "Inactif"}
                            </Badge>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInternship(internship);
                                setShowPublishInternship(true);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>

                            <Button
                              variant={
                                internship.isActive ? "destructive" : "default"
                              }
                              size="sm"
                              onClick={async () => {
                                try {
                                  console.log(
                                    `Tentative de mise à jour de l'état isActive pour l'offre ${
                                      internship.id
                                    } à ${!internship.isActive}`
                                  );

                                  const response = await fetch(
                                    `http://localhost:8080/api/internships/${internship.id}/activate`,
                                    {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      credentials: "include", // Pour envoyer les cookies de session
                                      body: JSON.stringify({
                                        isActive: !internship.isActive,
                                      }),
                                    }
                                  );

                                  console.log(
                                    `Réponse du serveur:`,
                                    response.status
                                  );

                                  if (!response.ok) {
                                    const errorData = await response.json();
                                    console.error(
                                      "Erreur détaillée:",
                                      errorData
                                    );
                                    throw new Error(
                                      errorData.message ||
                                        "Erreur lors de la mise à jour du statut"
                                    );
                                  }

                                  await refetchInternships();

                                  // Si l'offre est désactivée, rafraîchir également l'historique
                                  if (internship.isActive) {
                                    // Attendre un moment pour que les données des stages soient mises à jour
                                    setTimeout(() => {
                                      console.log(
                                        "Rafraîchissement de l'historique après désactivation d'une offre"
                                      );
                                      refetchHistory();
                                    }, 500);
                                  }

                                  toast({
                                    title: internship.isActive
                                      ? "Offre désactivée"
                                      : "Offre activée",
                                    description: internship.isActive
                                      ? "L'offre a été désactivée et n'est plus visible par les étudiants."
                                      : "L'offre a été activée et est maintenant visible par les étudiants.",
                                  });

                                  // Si l'offre est désactivée, suggérer à l'utilisateur de consulter l'historique
                                  if (internship.isActive) {
                                    toast({
                                      title: "Historique mis à jour",
                                      description:
                                        "L'offre désactivée est maintenant disponible dans l'historique des stages.",
                                    });
                                  }
                                } catch (error: any) {
                                  console.error("Erreur complète:", error);
                                  toast({
                                    title: "Erreur",
                                    description:
                                      error.message ||
                                      "Une erreur est survenue",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              {internship.isActive ? "Désactiver" : "Activer"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                      <Briefcase className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-base font-medium text-gray-900">
                      Aucune offre de stage
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                      Vous n'avez pas encore publié d'offre de stage. Commencez
                      par créer votre première offre pour attirer les talents.
                    </p>
                    <Button
                      className="mt-4 bg-primary-gradient"
                      onClick={() => setShowPublishInternship(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Publier une offre
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Applications */}
          {activeTab === "schools" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  École administrateur et partenaires
                </h1>
                <div className="space-x-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowAddPartnershipModal(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Demander un partenariat
                  </Button>
                </div>
              </div>

              {/* École administrateur - toujours visible pour toutes les entreprises */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-blue-800">
                        École Administrateur de la Plateforme
                      </h2>
                      <p className="text-blue-700 mt-1">
                        Cette école gère la plateforme Intega et valide les
                        offres de stage pour toutes les entreprises
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1">
                      Administrateur Principal
                    </Badge>
                  </div>

                  <div className="flex items-start mt-6">
                    <div className="flex-shrink-0 h-16 w-16 bg-white rounded-lg shadow-sm p-2 flex items-center justify-center border border-blue-200">
                      <School className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-6 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {adminSchool.name}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {adminSchool.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Site web</p>
                          <p className="text-sm font-medium">
                            {adminSchool.website}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Adresse</p>
                          <p className="text-sm font-medium">
                            {adminSchool.address}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Contact</p>
                          <p className="text-sm font-medium">
                            {adminSchool.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                      onClick={() => setShowAddPartnershipModal(true)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contacter l'école
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">
                  Vos partenariats avec les écoles
                </h2>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                {partnershipsLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-500">
                      Chargement des partenariats...
                    </p>
                  </div>
                ) : partnershipsData && partnershipsData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            École
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Statut
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date de début
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date de fin
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {partnershipsData.map((partnership: any) => (
                          <tr
                            key={`${partnership.schoolId}-${partnership.companyId}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {partnership.schoolLogo ? (
                                    <img
                                      className="h-10 w-10 rounded-full"
                                      src={partnership.schoolLogo}
                                      alt={partnership.schoolName}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <School className="h-5 w-5 text-blue-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {partnership.schoolName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {partnership.schoolLocation}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  partnership.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {partnership.status === "active"
                                  ? "Actif"
                                  : "Inactif"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                partnership.startDate
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {partnership.endDate
                                ? new Date(
                                    partnership.endDate
                                  ).toLocaleDateString()
                                : "Non définie"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Modifier
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto">
                      <School className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-2 text-base font-medium text-gray-900">
                      Aucun partenariat supplémentaire
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      En plus de l'école administrateur principal, vous n'avez
                      pas encore d'autres écoles partenaires.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="text-lg font-semibold mb-2">
                  Comment fonctionnent les partenariats ?
                </h3>
                <p className="text-gray-600">
                  Les partenariats avec les écoles vous permettent d'accéder à
                  un vivier de talents et de proposer des offres de stage
                  directement aux étudiants concernés. Toute entreprise a
                  automatiquement accès à l'école administrateur de la
                  plateforme qui gère l'ensemble du système. Des partenariats
                  supplémentaires avec d'autres écoles peuvent être établis pour
                  élargir votre réseau.
                </p>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Historique des stages
                </h1>
              </div>

              {historyLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : !internshipHistoryData?.histories ||
                internshipHistoryData.histories.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                    <CalendarClock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Aucun historique disponible
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    L'historique des stages terminés apparaîtra ici une fois que
                    vous aurez des stages complétés.
                  </p>
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("internships")}
                    >
                      Voir les offres de stage actives
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Titre du stage
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Stagiaire
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Période
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Statut
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {internshipHistoryData.histories.map((history: any) => (
                          <tr key={history.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {history.title || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {history.studentName ||
                                (history.status === "inactif"
                                  ? "Stage désactivé"
                                  : "N/A")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {history.startDate
                                ? new Date(
                                    history.startDate
                                  ).toLocaleDateString("fr-FR")
                                : "N/A"}{" "}
                              -{" "}
                              {history.endDate
                                ? new Date(history.endDate).toLocaleDateString(
                                    "fr-FR"
                                  )
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {history.status === "inactif" ? (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                  Désactivé
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  Terminé
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {history.status === "inactif" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // Extraire l'ID original du stage inactif
                                    const originalId = history.id.replace(
                                      "inactive-",
                                      ""
                                    );
                                    // Trouver le stage correspondant
                                    const internship =
                                      internshipData?.internships?.find(
                                        (i: any) => i.id == originalId
                                      );
                                    // Ouvrir le stage pour édition
                                    if (internship) {
                                      setSelectedInternship(internship);
                                      setShowPublishInternship(true);
                                    }
                                  }}
                                >
                                  Réactiver
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm">
                                  Détails
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h1>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <Button
                    variant="outline"
                    className="text-blue-600"
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Marquer tout comme lu
                  </Button>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6 divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`py-4 first:pt-0 last:pb-0 ${
                      !notification.read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`rounded-full p-2 ${
                          !notification.read ? "bg-blue-100" : "bg-gray-100"
                        } mr-3 mt-1`}
                      >
                        <Bell
                          className={`h-4 w-4 ${
                            !notification.read
                              ? "text-blue-700"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4
                              className={`font-medium ${
                                !notification.read
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              De: {notification.from}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {notification.time}
                          </p>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={
                              !notification.read
                                ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                                : ""
                            }
                          >
                            Voir
                          </Button>
                          {!notification.read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedNotifications = notifications.map(
                                  (n) =>
                                    n.id === notification.id
                                      ? { ...n, read: true }
                                      : n
                                );
                                setNotifications(updatedNotifications);
                                toast({
                                  title: "Notification lue",
                                  description:
                                    "La notification a été marquée comme lue",
                                });
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Marquer comme lu
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-12">
                    <div className="rounded-full p-3 bg-gray-100 inline-flex items-center justify-center mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Aucune notification
                    </h3>
                    <p className="text-gray-600">Vous êtes à jour !</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Paramètres du compte
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Langue
                      </h3>
                      <Select defaultValue="fr">
                        <SelectTrigger className="w-full md:w-1/3">
                          <SelectValue placeholder="Choisir une langue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Notifications par email
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-700">
                              Nouvelles candidatures
                            </span>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-700">
                              Messages des écoles partenaires
                            </span>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-700">
                              Notifications système
                            </span>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Sécurité
                      </h3>
                      <Button variant="outline" size="sm">
                        Changer le mot de passe
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Données et confidentialité
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Gérez vos données personnelles et les paramètres de
                    confidentialité.
                  </p>

                  <div className="space-y-4">
                    <Button variant="outline" size="sm">
                      Télécharger mes données
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Supprimer mon compte
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "applications" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Candidatures reçues
                </h1>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="border-b">
                  <Tabs defaultValue="all">
                    <TabsList className="w-full justify-start rounded-none border-b p-0 h-auto">
                      <TabsTrigger
                        value="all"
                        className={`rounded-none border-b-2 px-4 py-2 font-medium ${
                          applicationFilterType === "all"
                            ? "border-primary text-primary"
                            : "border-transparent"
                        }`}
                        onClick={() => setApplicationFilterType("all")}
                      >
                        Toutes
                        {applicationData?.applications?.length > 0 && (
                          <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs">
                            {applicationData.applications.length}
                          </span>
                        )}
                      </TabsTrigger>

                      <TabsTrigger
                        value="new"
                        className={`rounded-none border-b-2 px-4 py-2 font-medium ${
                          applicationFilterType === "new"
                            ? "border-primary text-primary"
                            : "border-transparent"
                        }`}
                        onClick={() => setApplicationFilterType("new")}
                      >
                        Nouvelles
                        {applicationData?.applications?.filter((app: any) => {
                          const createdAt = new Date(app.createdAt);
                          const sevenDaysAgo = new Date();
                          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                          return (
                            createdAt >= sevenDaysAgo &&
                            app.status === "pending"
                          );
                        }).length > 0 && (
                          <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                            {
                              applicationData.applications.filter(
                                (app: any) => {
                                  const createdAt = new Date(app.createdAt);
                                  const sevenDaysAgo = new Date();
                                  sevenDaysAgo.setDate(
                                    sevenDaysAgo.getDate() - 7
                                  );
                                  return (
                                    createdAt >= sevenDaysAgo &&
                                    app.status === "pending"
                                  );
                                }
                              ).length
                            }
                          </span>
                        )}
                      </TabsTrigger>

                      <TabsTrigger
                        value="inprogress"
                        className={`rounded-none border-b-2 px-4 py-2 font-medium ${
                          applicationFilterType === "inprogress"
                            ? "border-primary text-primary"
                            : "border-transparent"
                        }`}
                        onClick={() => setApplicationFilterType("inprogress")}
                      >
                        En cours
                        {applicationData?.applications?.filter(
                          (app: any) => app.status === "reviewing"
                        ).length > 0 && (
                          <span className="ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-600">
                            {
                              applicationData.applications.filter(
                                (app: any) => app.status === "reviewing"
                              ).length
                            }
                          </span>
                        )}
                      </TabsTrigger>

                      <TabsTrigger
                        value="accepted"
                        className={`rounded-none border-b-2 px-4 py-2 font-medium ${
                          applicationFilterType === "accepted"
                            ? "border-primary text-primary"
                            : "border-transparent"
                        }`}
                        onClick={() => setApplicationFilterType("accepted")}
                      >
                        Acceptées
                        {applicationData?.applications?.filter(
                          (app: any) => app.status === "accepted"
                        ).length > 0 && (
                          <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-600">
                            {
                              applicationData.applications.filter(
                                (app: any) => app.status === "accepted"
                              ).length
                            }
                          </span>
                        )}
                      </TabsTrigger>

                      <TabsTrigger
                        value="rejected"
                        className={`rounded-none border-b-2 px-4 py-2 font-medium ${
                          applicationFilterType === "rejected"
                            ? "border-primary text-primary"
                            : "border-transparent"
                        }`}
                        onClick={() => setApplicationFilterType("rejected")}
                      >
                        Refusées
                        {applicationData?.applications?.filter(
                          (app: any) => app.status === "rejected"
                        ).length > 0 && (
                          <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
                            {
                              applicationData.applications.filter(
                                (app: any) => app.status === "rejected"
                              ).length
                            }
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="p-4 border-b">
                  <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
                    <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Rechercher un candidat..."
                        className="pl-9"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Select defaultValue="date-desc">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Trier par" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date-desc">
                            Date (récent)
                          </SelectItem>
                          <SelectItem value="date-asc">
                            Date (ancien)
                          </SelectItem>
                          <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
                          <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {applicationLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-500">
                      Chargement des candidatures...
                    </p>
                  </div>
                ) : filteredApplications.length ? (
                  <div className="divide-y">
                    {filteredApplications.map((application: any) => (
                      <div
                        key={application.id}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationDetails(true);
                        }}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary-gradient text-white">
                                {application.studentName
                                  ? application.studentName
                                      .split(" ")
                                      .map((n: string) => n.charAt(0))
                                      .join("")
                                  : "??"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {application.studentName || "Étudiant"}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {application.studentSchool ||
                                  "École non spécifiée"}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <Briefcase className="h-3 w-3 mr-1 text-gray-400" />
                                  {application.internshipTitle ||
                                    "Stage inconnu"}
                                </span>
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <CalendarClock className="h-3 w-3 mr-1 text-gray-400" />
                                  Posté le{" "}
                                  {new Date(
                                    application.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-auto">
                            <Badge
                              variant={
                                application.status === "accepted"
                                  ? "default"
                                  : application.status === "rejected"
                                  ? "destructive"
                                  : application.status === "reviewing"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {application.status === "accepted" && "Accepté"}
                              {application.status === "rejected" && "Refusé"}
                              {application.status === "reviewing" && "En cours"}
                              {application.status === "pending" && "En attente"}
                            </Badge>

                            {application.status === "pending" && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateApplicationStatusMutation.mutate({
                                    id: application.id,
                                    status: "reviewing",
                                  });
                                }}
                              >
                                <FileCheck2 className="h-4 w-4 mr-1" />
                                Examiner
                              </Button>
                            )}

                            {application.status === "reviewing" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-500 text-green-600 hover:bg-green-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateApplicationStatusMutation.mutate({
                                      id: application.id,
                                      status: "accepted",
                                    });
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Accepter
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500 text-red-600 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateApplicationStatusMutation.mutate({
                                      id: application.id,
                                      status: "rejected",
                                    });
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Refuser
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                      <UserPlus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-base font-medium text-gray-900">
                      Aucune candidature trouvée
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                      {applicationFilterType === "all"
                        ? "Aucune candidature n'a été reçue. Publiez des offres de stage pour commencer à recevoir des candidatures."
                        : "Aucune candidature ne correspond aux critères sélectionnés."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dialogues et modals */}
      <Dialog
        open={showPublishInternship}
        onOpenChange={setShowPublishInternship}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedInternship
                ? "Modifier l'offre de stage"
                : "Publier une nouvelle offre de stage"}
            </DialogTitle>
            <DialogDescription>
              {selectedInternship
                ? "Modifiez les détails de votre offre de stage. Les changements seront visibles immédiatement."
                : "Remplissez les détails de votre offre de stage pour la publier sur la plateforme."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du stage *</Label>
              <Input
                id="title"
                placeholder="ex: Développeur web fullstack"
                value={formData.title}
                onChange={handleFormChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Lieu *</Label>
                <Input
                  id="location"
                  placeholder="ex: Paris, France"
                  value={formData.location}
                  onChange={handleFormChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée *</Label>
                <Input
                  id="duration"
                  placeholder="ex: 6 mois"
                  value={formData.duration}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Décrivez le stage, ses objectifs et le contexte de l'entreprise..."
                value={formData.description}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Prérequis</Label>
              <textarea
                id="requirements"
                className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Compétences, formation ou expérience requises..."
                value={formData.requirements}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsabilités</Label>
              <textarea
                id="responsibilities"
                className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tâches et responsabilités du stagiaire..."
                value={formData.responsibilities}
                onChange={handleFormChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                className="rounded border-gray-300 text-primary focus:ring-primary"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
              />
              <Label htmlFor="isActive" className="text-sm font-normal">
                Publier immédiatement (visible par les étudiants)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPublishInternship(false)}
            >
              Annuler
            </Button>
            <Button
              className="bg-primary-gradient"
              // onClick={async () => {
              //   if (!formData.title || !formData.location || !formData.duration || !formData.description) {
              //     toast({
              //       title: "Champs manquants",
              //       description: "Veuillez remplir tous les champs obligatoires",
              //       variant: "destructive"
              //     });
              //     return;
              //   }

              //   try {
              //     const endpoint = selectedInternship
              //       ? `/api/internships/${selectedInternship.id}`
              //       : '/api/internships';

              //     const method = selectedInternship ? 'PUT' : 'POST';

              //     // Assurons-nous que l'ID de l'entreprise est inclus dans les données
              //     const dataToSend = {
              //       ...formData,
              //       companyId: userProfile?.id // Ajouter l'ID de l'entreprise
              //     };

              //     console.log("Données à envoyer:", dataToSend);

              //     const response = await fetch("http://localhost:8080"+endpoint, {
              //       method,
              //       headers: {
              //         'Content-Type': 'application/json',
              //       },
              //       credentials: 'include', // Inclure les cookies pour l'authentification
              //       body: JSON.stringify(dataToSend),
              //     });

              //     if (!response.ok) {
              //       const errorData = await response.json().catch(() => ({ message: "Erreur inconnue" }));
              //       console.error("Erreur détaillée:", errorData);
              //       throw new Error(errorData.message || 'Erreur lors de la sauvegarde de l\'offre');
              //     }

              //     const data = await response.json();

              //     await refetchInternships();

              //     toast({
              //       title: selectedInternship ? "Offre mise à jour" : "Offre publiée",
              //       description: selectedInternship
              //         ? "Votre offre de stage a été mise à jour avec succès."
              //         : "Votre offre de stage a été publiée avec succès.",
              //     });

              //     setShowPublishInternship(false);
              //     setFormData({
              //       title: '',
              //       location: '',
              //       duration: '',
              //       description: '',
              //       requirements: '',
              //       responsibilities: '',
              //       isActive: true
              //     });
              //   } catch (error: any) {
              //     toast({
              //       title: "Erreur",
              //       description: error.message || "Une erreur est survenue",
              //       variant: "destructive",
              //     });
              //   }
              // }}
              onClick={handlePublishInternship}
            >
              {selectedInternship ? "Mettre à jour" : "Publier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showApplicationDetails}
        onOpenChange={setShowApplicationDetails}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle>Détails de la candidature</DialogTitle>
                <DialogDescription>
                  Candidature de {selectedApplication.studentName} pour le poste
                  de {selectedApplication.internshipTitle}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary-gradient text-white text-xl">
                      {selectedApplication.studentName
                        ? selectedApplication.studentName
                            .split(" ")
                            .map((n: string) => n.charAt(0))
                            .join("")
                        : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedApplication.studentName || "Étudiant"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedApplication.studentEmail ||
                        "Email non disponible"}
                    </p>
                    <div className="flex items-center mt-1">
                      <Badge
                        variant={
                          selectedApplication.status === "accepted"
                            ? "default"
                            : selectedApplication.status === "rejected"
                            ? "destructive"
                            : selectedApplication.status === "reviewing"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {selectedApplication.status === "accepted" && "Accepté"}
                        {selectedApplication.status === "rejected" && "Refusé"}
                        {selectedApplication.status === "reviewing" &&
                          "En cours d'examen"}
                        {selectedApplication.status === "pending" &&
                          "En attente"}
                      </Badge>
                      <span className="ml-2 text-xs text-gray-500">
                        Candidature soumise le{" "}
                        {new Date(
                          selectedApplication.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start space-x-3">
                    <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {selectedApplication.internshipTitle}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-sm text-gray-500">
                          {selectedApplication.internshipLocation ||
                            "Lieu non spécifié"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {selectedApplication.internshipDuration ||
                            "Durée non spécifiée"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Lettre de motivation
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedApplication.coverLetter ||
                        "Aucune lettre de motivation fournie."}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Profil de l'étudiant
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">École</p>
                        <p className="text-sm font-medium">
                          {selectedApplication.studentSchool || "Non spécifiée"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Niveau d'études</p>
                        <p className="text-sm font-medium">
                          {selectedApplication.studentEducationLevel ||
                            "Non spécifié"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Domaine d'études
                        </p>
                        <p className="text-sm font-medium">
                          {selectedApplication.studentField || "Non spécifié"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Année de diplomation
                        </p>
                        <p className="text-sm font-medium">
                          {selectedApplication.studentGraduationYear ||
                            "Non spécifiée"}
                        </p>
                      </div>
                    </div>

                    {selectedApplication.studentSkills && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Compétences
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {selectedApplication.studentSkills
                            .split(",")
                            .map((skill: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {skill.trim()}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Documents
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    {selectedApplication.cvPath ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm">CV</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const cvUrl = `http://localhost:8080/api/download?path=${encodeURIComponent(
                              selectedApplication.cvPath
                            )}`;
                            const link = document.createElement("a");
                            link.href = cvUrl;
                            link.download = `CV_${selectedApplication.studentName}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Aucun CV fourni.</p>
                    )}
                    {["accepted", "documents_shared"].includes(
                      selectedApplication.status
                    ) &&
                      sharedDocs.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {sharedDocs.map((doc) => (
                            <div
                              key={doc.document_id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-sm">{doc.name}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const docUrl = `http://localhost:8080/api/download?path=${encodeURIComponent(
                                    doc.path
                                  )}`;
                                  const link = document.createElement("a");
                                  link.href = docUrl;
                                  link.download = doc.name;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Télécharger
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Autres documents si disponibles */}
                  </div>
                </div>
              </div>

              <DialogFooter>
                {selectedApplication.status === "pending" && (
                  <Button
                    className="bg-primary-gradient"
                    onClick={() => {
                      updateApplicationStatusMutation.mutate({
                        id: selectedApplication.id,
                        status: "reviewing",
                      });
                      setShowApplicationDetails(false);
                    }}
                  >
                    <FileCheck2 className="h-4 w-4 mr-2" />
                    Commencer l'examen
                  </Button>
                )}

                {selectedApplication.status === "reviewing" && (
                  <>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        updateApplicationStatusMutation.mutate({
                          id: selectedApplication.id,
                          status: "rejected",
                        });
                        setShowApplicationDetails(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>

                    <Button
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                      onClick={() => {
                        updateApplicationStatusMutation.mutate({
                          id: selectedApplication.id,
                          status: "accepted",
                        });
                        setShowApplicationDetails(false);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accepter
                    </Button>
                  </>
                )}

                <Button
                  variant="secondary"
                  onClick={() => {
                    window.location.href = `/messaging?to=${selectedApplication.studentId}`;
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal pour contacter l'école administrateur */}
      <Dialog
        open={showAddPartnershipModal}
        onOpenChange={setShowAddPartnershipModal}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Contacter l'école administrateur</DialogTitle>
            <DialogDescription>
              Envoyez un message à l'école ENSA Tanger qui gère la plateforme
              Intega
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4 flex items-start">
              <div className="flex-shrink-0 mr-3">
                <School className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  École Nationale des Sciences Appliquées de Tanger
                </h4>
                <p className="text-sm text-gray-600">
                  L'ENSA Tanger est l'école administrateur principale de la
                  plateforme Intega. Elle valide toutes les offres de stage et
                  supervise les processus académiques.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageSubject">Sujet *</Label>
              <Select
                value={partnershipFormData.status || "partnership"}
                onValueChange={(value) =>
                  setPartnershipFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez un sujet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partnership">
                    Demande de partenariat
                  </SelectItem>
                  <SelectItem value="internship">
                    Question sur les stages
                  </SelectItem>
                  <SelectItem value="students">
                    Recrutement d'étudiants
                  </SelectItem>
                  <SelectItem value="other">Autre demande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageContent">Message *</Label>
              <Textarea
                id="messageContent"
                placeholder="Décrivez votre demande en détail..."
                className="min-h-[120px]"
                value={partnershipFormData.messageContent || ""}
                onChange={(e) =>
                  setPartnershipFormData((prev) => ({
                    ...prev,
                    messageContent: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date souhaitée (optionnel)</Label>
                <Input
                  id="startDate"
                  type="date"
                  className="w-full"
                  value={partnershipFormData.startDate}
                  onChange={handlePartnershipFormChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachFile">Pièce jointe (optionnel)</Label>
                <Input id="attachFile" type="file" className="w-full" />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-blue-500 flex-shrink-0"></div>
                <h4 className="font-semibold text-blue-800">Important</h4>
              </div>
              <p className="text-sm text-blue-700">
                Votre entreprise est déjà partenaire avec l'école administrateur
                ENSA Tanger par défaut. Ce formulaire est destiné à la
                communication et aux demandes spécifiques.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddPartnershipModal(false)}
            >
              Annuler
            </Button>
            <Button onClick={requestPartnership}>Envoyer le message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour télécharger un logo */}
      <Dialog open={showLogoUpload} onOpenChange={setShowLogoUpload}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Télécharger un logo</DialogTitle>
            <DialogDescription>
              Choisissez une image pour représenter votre entreprise. Cette
              image sera affichée sur votre profil et vos offres de stage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Fichier image</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setLogoFile(e.target.files[0]);
                  }
                }}
              />
              <p className="text-sm text-gray-500">
                Format recommandé: PNG ou JPG, carré, minimum 200x200px
              </p>
            </div>

            {logoFile && (
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Aperçu du logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setLogoFile(null);
                setShowLogoUpload(false);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={uploadLogo}
              disabled={!logoFile || isLogoUploading}
            >
              {isLogoUploading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Téléchargement...
                </>
              ) : (
                "Télécharger"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour modifier le profil de l'entreprise */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier le profil de l'entreprise</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de votre entreprise pour aider les
              étudiants à mieux vous connaître.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'entreprise</Label>
              <Input
                id="name"
                name="name"
                value={profileFormData.name}
                onChange={handleProfileChange}
                placeholder="Nom de votre entreprise"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={profileFormData.description || ""}
                onChange={handleProfileChange}
                placeholder="Décrivez votre entreprise en quelques phrases"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industrie</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={profileFormData.industry || ""}
                  onChange={handleProfileChange}
                  placeholder="Ex: Technologie, Finance, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Emplacement</Label>
                <Input
                  id="location"
                  name="location"
                  value={profileFormData.location || ""}
                  onChange={handleProfileChange}
                  placeholder="Ville, Pays"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  name="website"
                  value={profileFormData.website || ""}
                  onChange={handleProfileChange}
                  placeholder="https://www.votreentreprise.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Taille de l'entreprise</Label>
                <Input
                  id="size"
                  name="size"
                  value={profileFormData.size || ""}
                  onChange={handleProfileChange}
                  placeholder="Ex: 1-10, 11-50, 51-200, etc."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={updateCompanyProfile}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
