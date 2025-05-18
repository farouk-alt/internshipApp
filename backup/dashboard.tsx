import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../client/src/hooks/use-auth";
import { Student } from "../shared/schema";
import { Button } from "../client/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../client/src/components/ui/card";
import { Progress } from "../client/src/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../client/src/components/ui/tabs";
import { Badge } from "../client/src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../client/src/components/ui/avatar";
import { 
  BookOpenCheck, 
  BriefcaseBusiness, 
  CalendarClock, 
  ChevronRight, 
  FileText, 
  Search,
  BellRing,
  ArrowUpRight,
  BookMarked,
  User,
  LogOut,
  FileEdit,
  Bell,
  LayoutDashboard,
  Settings
} from "lucide-react";
import React from "react";

// Composant pour le logo Intega
const IntegaLogo = () => (
  <div className="relative mr-2">
    <svg width="28" height="28" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-shadow">
      {/* Cercle extérieur avec dégradé */}
      <circle cx="100" cy="100" r="90" fill="url(#logoGradient)" />
      
      {/* Forme intérieure - "I" */}
      <path d="M100 40 L100 160" stroke="white" strokeWidth="20" strokeLinecap="round" />
      
      {/* Arc pour le "n" */}
      <path d="M60 100 C60 60, 100 60, 100 100" stroke="white" strokeWidth="15" strokeLinecap="round" fill="none" />
      
      {/* Arc pour le "t" */}
      <path d="M140 80 L140 140 C140 160, 120 160, 100 160" stroke="white" strokeWidth="15" strokeLinecap="round" fill="none" />
      
      {/* La barre du t */}
      <path d="M120 100 L160 100" stroke="white" strokeWidth="15" strokeLinecap="round" />
      
      {/* Point lumineux */}
      <circle cx="150" cy="60" r="15" fill="white" fillOpacity="0.8" />
      
      {/* Définition du dégradé */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0061ff" />
          <stop offset="100%" stopColor="#60efff" />
        </linearGradient>
      </defs>
    </svg>
    
    {/* Effet lumineux */}
    <div className="absolute -inset-1 bg-blue-500 opacity-30 blur-lg rounded-full animate-pulse"></div>
  </div>
);

// Données de test (à remplacer par des données réelles)
const mockInternships = [
  {
    id: 1,
    title: "Développeur Frontend",
    company: "TechSolutions",
    location: "Paris",
    status: "En attente",
    date: "Il y a 2 jours"
  },
  {
    id: 2, 
    title: "UX/UI Designer",
    company: "DesignStudio",
    location: "Lyon",
    status: "Refusé",
    date: "Il y a 5 jours"
  },
  {
    id: 3,
    title: "Ingénieur Data",
    company: "DataTech",
    location: "Marseille",
    status: "Entretien",
    date: "Il y a 1 jour"
  }
];

const mockDocuments = [
  {
    id: 1,
    name: "CV_2025.pdf",
    type: "CV",
    uploaded: "24 Avril 2025"
  },
  {
    id: 2,
    name: "Lettre_Motivation.docx",
    type: "Lettre de motivation",
    uploaded: "22 Avril 2025"
  },
  {
    id: 3,
    name: "Portfolio_Design.pdf",
    type: "Portfolio",
    uploaded: "20 Avril 2025"
  }
];

const mockNotifications = [
  {
    id: 1,
    title: "Nouvelle offre disponible",
    description: "Une offre correspondant à votre profil vient d'être publiée",
    time: "Il y a 1 heure",
    read: false
  },
  {
    id: 2,
    title: "Entretien confirmé",
    description: "Votre entretien avec DataTech a été confirmé pour le 29 avril",
    time: "Il y a 3 heures",
    read: false
  },
  {
    id: 3,
    title: "Document validé",
    description: "Votre CV a été validé par votre école",
    time: "Hier",
    read: true
  }
];

const mockRecommendedInternships = [
  {
    id: 4,
    title: "Développeur Full Stack",
    company: "WebInnovation",
    match: 95,
    location: "Bordeaux",
    date: "Publié hier"
  },
  {
    id: 5,
    title: "Designer d'Interface",
    company: "CreativeAgency",
    match: 82,
    location: "Paris",
    date: "Publié il y a 2 jours"
  },
  {
    id: 6,
    title: "Développeur Mobile",
    company: "MobileFirst",
    match: 78,
    location: "Lille",
    date: "Publié il y a 3 jours"
  }
];

export default function StudentDashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [unreadCount, setUnreadCount] = useState(2);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Récupérer les informations du profil étudiant
  const { data: profile, isLoading: profileLoading } = useQuery<Student>({
    queryKey: ['/api/profile/student'],
    enabled: !!user
  });

  console.log("User:", user);
  console.log("Student profile:", profile);

  // Combiner les données d'utilisateur et de profil étudiant
  const studentProfile = {
    name: profile ? `${profile.firstName} ${profile.lastName}` : (user ? user.username : 'Étudiant'),
    avatar: profile?.avatar || null,
    school: profile?.schoolId ? `École #${profile.schoolId}` : 'Non spécifiée',
    program: profile?.program || 'Non spécifié',
    applications: 0, // À remplacer par le nombre réel de candidatures
    completedProfile: profile ? 80 : 30, // Calculer en fonction des champs remplis
    graduationYear: profile?.graduationYear || 'Non spécifié'
  };

  useEffect(() => {
    // Définir le titre de la page
    document.title = "Tableau de bord étudiant - Intega";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay pour la sidebar mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Desktop and Mobile avec Toggle */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
            <div className="p-4">
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={studentProfile.avatar || ""} />
                  <AvatarFallback className="bg-primary-gradient text-white">
                    {studentProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-[140px]">{studentProfile.name}</p>
                  <p className="text-sm text-gray-500">Étudiant</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button 
                  type="button"
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-accent hover:text-accent-foreground'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <LayoutDashboard className="h-5 w-5 mr-3" />
                  Vue d'ensemble
                </button>
                
                <button 
                  type="button" 
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'applications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-accent hover:text-accent-foreground'}`}
                  onClick={() => setActiveTab('applications')}
                >
                  <BriefcaseBusiness className="h-5 w-5 mr-3" />
                  Mes candidatures
                </button>
                
                <button 
                  type="button"
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'search' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-accent hover:text-accent-foreground'}`}
                  onClick={() => setActiveTab('search')}
                >
                  <Search className="h-5 w-5 mr-3" />
                  Recherche stages
                </button>
                
                <button 
                  type="button"
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'documents' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-accent hover:text-accent-foreground'}`}
                  onClick={() => setActiveTab('documents')}
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Documents
                </button>
                
                <div className="relative">
                  <button 
                    type="button"
                    className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-accent hover:text-accent-foreground'}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <Bell className="h-5 w-5 mr-3" />
                    Notifications
                    {unreadCount > 0 && (
                      <div className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}
                  </button>
                </div>
                
                <button 
                  type="button"
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-accent hover:text-accent-foreground'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="h-5 w-5 mr-3" />
                  Mon profil
                </button>
                
                <button 
                  type="button"
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-accent hover:text-accent-foreground'}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Paramètres
                </button>
              </nav>
            </div>
          </div>
          
          <div className="mt-auto p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* En-tête mobile avec bouton menu */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center h-9 w-9 rounded-md mr-2 text-sm font-medium transition-colors bg-transparent hover:bg-accent hover:text-accent-foreground lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <IntegaLogo />
            <h1 className="text-xl font-bold text-gray-900">Intega</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              type="button"
              className="inline-flex items-center justify-center h-10 w-10 rounded-md text-sm font-medium transition-colors bg-transparent hover:bg-accent hover:text-accent-foreground relative"
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={studentProfile.avatar || ""} />
              <AvatarFallback className="bg-primary-gradient text-white text-sm">
                {studentProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <main className="p-4 lg:p-8">
          {/* Vue d'ensemble */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
                <div className="flex items-center">
                  <p className="text-sm text-gray-500 mr-2">Aujourd'hui: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Candidatures</p>
                        <h3 className="text-2xl font-bold mt-1 text-gray-900">{studentProfile.applications}</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <BriefcaseBusiness className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Profil complété</p>
                        <h3 className="text-2xl font-bold mt-1 text-gray-900">{studentProfile.completedProfile}%</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <User className="h-6 w-6" />
                      </div>
                    </div>
                    <Progress value={studentProfile.completedProfile} className="h-1.5 mt-4" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Documents</p>
                        <h3 className="text-2xl font-bold mt-1 text-gray-900">{mockDocuments.length}</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <FileText className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Notifications</p>
                        <h3 className="text-2xl font-bold mt-1 text-gray-900">{unreadCount}</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
                        <BellRing className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle>Stages recommandés</CardTitle>
                        <button 
                          type="button"
                          className="inline-flex items-center justify-center text-sm text-blue-600 rounded-md hover:bg-blue-50 px-3 py-1.5 transition-colors"
                        >
                          Voir tout
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                            <path d="M9 18L15 12L9 6"/>
                          </svg>
                        </button>
                      </div>
                      <CardDescription>
                        Basé sur votre profil et vos intérêts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockRecommendedInternships.map(internship => (
                          <div key={internship.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                            <div className="bg-primary-gradient h-12 w-12 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                              {internship.company.substring(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-base font-medium text-gray-900 truncate">{internship.title}</h4>
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 ml-2">
                                  {internship.match}% compatible
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{internship.company}</p>
                              <div className="flex items-center text-xs text-gray-500">
                                <span>{internship.location}</span>
                                <span className="mx-2">•</span>
                                <span>{internship.date}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="ml-2 inline-flex items-center justify-center rounded-md p-2.5 text-gray-600 hover:bg-gray-100"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 17L17 7"/>
                                <path d="M7 7h10v10"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Récentes notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockNotifications.slice(0, 3).map(notification => (
                          <div key={notification.id} className={`p-3 ${notification.read ? 'bg-gray-50' : 'bg-blue-50'} rounded-lg`}>
                            <div className="flex items-start">
                              <div className={`rounded-full p-2 ${notification.read ? 'bg-gray-200' : 'bg-blue-200'} mr-3 mt-1`}>
                                <Bell className="h-4 w-4 text-gray-700" />
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">{notification.title}</h5>
                                <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                                <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="w-full border border-gray-300 bg-white px-4 py-2 text-blue-600 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Voir toutes les notifications
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Mes candidatures récentes</CardTitle>
                    <button 
                      type="button"
                      className="inline-flex items-center justify-center text-sm text-blue-600 rounded-md hover:bg-blue-50 px-3 py-1.5 transition-colors"
                    >
                      Voir tout
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M9 18L15 12L9 6"/>
                      </svg>
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-gray-500 bg-gray-50 border-b">
                          <th className="px-4 py-3 text-left">Stage</th>
                          <th className="px-4 py-3 text-left">Entreprise</th>
                          <th className="px-4 py-3 text-left">Localisation</th>
                          <th className="px-4 py-3 text-left">Statut</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockInternships.map(internship => (
                          <tr key={internship.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-4 font-medium text-gray-900">{internship.title}</td>
                            <td className="px-4 py-4 text-gray-600">{internship.company}</td>
                            <td className="px-4 py-4 text-gray-600">{internship.location}</td>
                            <td className="px-4 py-4">
                              <Badge className={`
                                ${internship.status === 'En attente' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                                ${internship.status === 'Refusé' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                                ${internship.status === 'Entretien' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                              `}>
                                {internship.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 text-gray-600">{internship.date}</td>
                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                className="inline-flex items-center justify-center text-sm text-blue-600 rounded-md hover:bg-blue-50 px-3 py-1.5 transition-colors"
                              >
                                Détails
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                                  <path d="M9 18L15 12L9 6"/>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Contenu pour les autres onglets (à implémenter) */}
          {activeTab !== "overview" && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="mb-4">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <BookOpenCheck className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Page en développement</h2>
              <p className="text-gray-600 mb-4">
                L'onglet "{activeTab}" est en cours de développement et sera bientôt disponible.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Retour à la vue d'ensemble
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}