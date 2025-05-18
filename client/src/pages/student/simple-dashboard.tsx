import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Student } from "@shared/schema";

// Composants simplifiés pour remplacer shadcn
const Card = ({ className = "", children, ...props }) => (
  <div className={`bg-white rounded-lg shadow ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className = "", children, ...props }) => (
  <div className={`p-6 pb-3 ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ className = "", children, ...props }) => (
  <div className={`p-6 pt-3 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ className = "", children, ...props }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ className = "", children, ...props }) => (
  <p className={`text-sm text-gray-500 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

const Progress = ({ value = 0, className = "", ...props }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`} {...props}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

const Badge = ({ className = "", children, ...props }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`} {...props}>
    {children}
  </span>
);

const Avatar = ({ className = "", children, ...props }) => (
  <div className={`relative inline-block rounded-full ${className}`} {...props}>
    {children}
  </div>
);

const AvatarImage = ({ src = "", className = "", ...props }) => (
  src ? <img src={src} className={`rounded-full object-cover w-full h-full ${className}`} {...props} /> : null
);

const AvatarFallback = ({ className = "", children, ...props }) => (
  <div className={`flex items-center justify-center rounded-full bg-gray-200 text-gray-700 w-full h-full ${className}`} {...props}>
    {children}
  </div>
);

// SVG Icons comme composants
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18L15 12L9 6" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const BookOpenCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H2v15h7c1.7 0 3 1.3 3 3V7c0-2.2-1.8-4-4-4Z" />
    <path d="m16 12 2 2 4-4" />
    <path d="M22 6V3h-6c-2.2 0-4 1.8-4 4v14c0-1.7 1.3-3 3-3h7v-2.3" />
  </svg>
);

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
    queryKey: ['http://localhost:8080/api/profile/student'],
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
              <button 
                type="button" 
                className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100" 
                onClick={() => setSidebarOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
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
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <DashboardIcon />
                  <span className="ml-3">Vue d'ensemble</span>
                </button>
                
                <button 
                  type="button" 
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md ${activeTab === 'applications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('applications')}
                >
                  <BriefcaseIcon />
                  <span className="ml-3">Mes candidatures</span>
                </button>
                
                <button 
                  type="button"
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md ${activeTab === 'search' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('search')}
                >
                  <SearchIcon />
                  <span className="ml-3">Recherche stages</span>
                </button>
                
                <button 
                  type="button"
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md ${activeTab === 'documents' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('documents')}
                >
                  <FileIcon />
                  <span className="ml-3">Documents</span>
                </button>
                
                <div className="relative">
                  <button 
                    type="button"
                    className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <BellIcon />
                    <span className="ml-3">Notifications</span>
                    {unreadCount > 0 && (
                      <div className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}
                  </button>
                </div>
                
                <button 
                  type="button"
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <UserIcon />
                  <span className="ml-3">Mon profil</span>
                </button>
                
                <button 
                  type="button"
                  className={`inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium transition-colors rounded-md ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <SettingsIcon />
                  <span className="ml-3">Paramètres</span>
                </button>
              </nav>
            </div>
          </div>
          
          <div className="p-4 border-t mt-auto">
            <button
              type="button"
              className="inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium text-red-600 transition-colors rounded-md hover:bg-red-50"
              onClick={() => logoutMutation.mutate()}
            >
              <LogoutIcon />
              <span className="ml-3">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2 bg-white shadow-sm h-16">
          <button 
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-xl font-bold text-gray-900 ml-4 lg:ml-0">{
            activeTab === 'overview' ? 'Vue d\'ensemble' :
            activeTab === 'applications' ? 'Mes candidatures' :
            activeTab === 'search' ? 'Recherche de stages' :
            activeTab === 'documents' ? 'Mes documents' :
            activeTab === 'notifications' ? 'Notifications' :
            activeTab === 'profile' ? 'Mon profil' :
            activeTab === 'settings' ? 'Paramètres' : 'Tableau de bord'
          }</h1>
          
          <div className="flex items-center space-x-2">
            <button 
              type="button"
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100 relative"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setActiveTab('profile')}>
              <AvatarImage src={studentProfile.avatar || ""} />
              <AvatarFallback className="bg-primary-gradient text-white">
                {studentProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        <main className="p-4 md:p-6">
          {/* Affichage du contenu en fonction de l'onglet actif */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mon profil</CardTitle>
                    <CardDescription>Complétez votre profil pour maximiser vos chances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">Profil complété à {studentProfile.completedProfile}%</p>
                          <Progress value={studentProfile.completedProfile} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">Améliorez votre profil</h4>
                            <p className="text-sm mt-1">Ajoutez un portfolio pour mettre en valeur vos projets</p>
                          </div>
                          <button 
                            type="button"
                            className="p-2 rounded-md text-blue-600 hover:bg-blue-100"
                            onClick={() => setActiveTab('profile')}
                          >
                            <ArrowUpRightIcon />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-sm text-gray-500">Programme</p>
                          <p className="font-medium text-gray-900">{studentProfile.program}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Année de diplôme</p>
                          <p className="font-medium text-gray-900">{studentProfile.graduationYear}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">École</p>
                          <p className="font-medium text-gray-900">{studentProfile.school}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Candidatures</p>
                          <p className="font-medium text-gray-900">{studentProfile.applications}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle>Stages recommandés</CardTitle>
                        <button 
                          type="button"
                          className="inline-flex items-center justify-center text-sm text-blue-600 rounded-md hover:bg-blue-50 px-3 py-1.5 transition-colors"
                        >
                          Voir tout
                          <ChevronRightIcon />
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
                              <ArrowUpRightIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                
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
                                <BellIcon />
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
                      <ChevronRightIcon />
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
                                <ChevronRightIcon />
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
                  <BookOpenCheckIcon />
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