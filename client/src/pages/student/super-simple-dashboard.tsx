import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Student } from "@shared/schema";

// Composant simple pour une section
const Section = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

export default function SuperSimpleStudentDashboard() {
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Récupérer les informations du profil étudiant
  const { data: profile } = useQuery<Student>({
    queryKey: ['http://localhost:8080/api/profile/student'],
    enabled: !!user
  });

  console.log("User:", user);
  console.log("Student profile:", profile);

  const profileName = profile ? `${profile.firstName} ${profile.lastName}` : (user ? user.username : 'Étudiant');
  
  // Fonction pour afficher un message d'alerte temporaire
  const showNotification = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };
  
  useEffect(() => {
    document.title = "Tableau de bord étudiant - Intega";
  }, []);

  // Gestionnaire de clics pour les éléments cliquables
  const handleItemClick = (itemName: string) => {
    setActiveItem(itemName);
    showNotification(`Vous avez cliqué sur "${itemName}"`);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Alerte flottante */}
      {showAlert && (
        <div className="fixed top-5 right-5 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out">
          {alertMessage}
        </div>
      )}
      
      {/* Header avec menu mobile */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 mr-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="text-xl font-bold text-blue-600">Intega</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-800 mr-4">{profileName}</span>
              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                className="text-red-600 hover:text-red-800"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 px-2 space-y-1">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick("Tableau de bord");
                    setSidebarOpen(false);
                  }}
                  className="bg-gray-100 text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                >
                  Tableau de bord
                </a>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick("Candidatures");
                    setSidebarOpen(false);
                  }}
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                >
                  Candidatures
                </a>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick("Stages");
                    setSidebarOpen(false);
                  }}
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                >
                  Stages
                </a>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick("Documents");
                    setSidebarOpen(false);
                  }}
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                >
                  Documents
                </a>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick("Profil");
                    setSidebarOpen(false);
                  }}
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                >
                  Profil
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}
      


      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord étudiant</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Section title="Mon profil">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{profileName}</h3>
                    <p className="text-sm text-gray-500">{profile?.program || 'Programme non spécifié'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleItemClick("Éditer profil")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Éditer profil
                  </button>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Complétion du profil: 75%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">École</p>
                    <p className="font-medium">{profile?.schoolId ? `École #${profile.schoolId}` : 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Promotion</p>
                    <p className="font-medium">{profile?.graduationYear || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>
            </Section>
            
            <Section title="Stages recommandés">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Basé sur votre profil et vos centres d'intérêt</p>
                  <button 
                    onClick={() => handleItemClick("Voir tous les stages")}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Voir tout
                  </button>
                </div>
                
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer" 
                  onClick={() => handleItemClick("Développeur Full Stack chez WebInnovation")}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Développeur Full Stack</h3>
                      <p className="text-sm text-gray-600">WebInnovation - Bordeaux</p>
                      <p className="text-xs text-gray-500 mt-1">Publié hier</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      95% compatible
                    </span>
                  </div>
                </div>
                
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleItemClick("Designer d'Interface chez CreativeAgency")}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Designer d'Interface</h3>
                      <p className="text-sm text-gray-600">CreativeAgency - Paris</p>
                      <p className="text-xs text-gray-500 mt-1">Publié il y a 2 jours</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      82% compatible
                    </span>
                  </div>
                </div>
              </div>
            </Section>
          </div>
          
          <div>
            <Section title="Activité récente">
              <div className="divide-y divide-gray-200">
                <div className="py-3">
                  <p className="text-sm font-medium">Nouvelle offre disponible</p>
                  <p className="text-xs text-gray-500">Il y a 1 heure</p>
                </div>
                <div className="py-3">
                  <p className="text-sm font-medium">Entretien confirmé</p>
                  <p className="text-xs text-gray-500">Il y a 3 heures</p>
                </div>
                <div className="py-3">
                  <p className="text-sm font-medium">Document validé</p>
                  <p className="text-xs text-gray-500">Hier</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleItemClick("Voir toutes les notifications")}
                className="w-full mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-blue-600 hover:bg-gray-50"
              >
                Voir toutes les notifications
              </button>
            </Section>
            
            <Section title="Documents importants">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm">CV_2025.pdf</p>
                  <button 
                    onClick={() => handleItemClick("CV_2025.pdf")}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Voir
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Lettre_Motivation.docx</p>
                  <button 
                    onClick={() => handleItemClick("Lettre_Motivation.docx")}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Voir
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Portfolio_Design.pdf</p>
                  <button 
                    onClick={() => handleItemClick("Portfolio_Design.pdf")}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Voir
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleItemClick("Gérer mes documents")}
                className="w-full mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-blue-600 hover:bg-gray-50"
              >
                Gérer mes documents
              </button>
            </Section>
          </div>
        </div>
        
        <Section title="Mes candidatures récentes">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Développeur Frontend</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">TechSolutions</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Paris</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Il y a 2 jours</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleItemClick("Détails de la candidature pour Développeur Frontend");
                      }} 
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Détails
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">UX/UI Designer</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">DesignStudio</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Lyon</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Refusé</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Il y a 5 jours</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleItemClick("Détails de la candidature pour UX/UI Designer");
                      }} 
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Détails
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ingénieur Data</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">DataTech</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Marseille</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Entretien</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Il y a 1 jour</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleItemClick("Détails de la candidature pour Ingénieur Data");
                      }} 
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Détails
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      </main>
    </div>
  );
}