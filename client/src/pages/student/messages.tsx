import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Message, User } from "@shared/schema";
import { Send, Search, User as UserIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

type Contact = {
  id: number;
  name: string;
  email: string;
  userType: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  avatar?: string;
};

export default function StudentMessages() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Récupérer l'utilisateur connecté via useAuth
  const { user } = useAuth();
  
  console.log("StudentMessages - user from useAuth:", user);

  // Récupérer les contacts (écoles et entreprises)
  const { data: contacts, isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ["/api/student/contacts"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Récupérer les messages avec le contact sélectionné
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedContact?.id],
    enabled: !!selectedContact && !!user,
    refetchInterval: 10000, // Rafraîchir toutes les 10 secondes
  });

  // Mutation pour envoyer un message
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { receiverId: number; content: string }) => {
      const response = await apiRequest("POST", "/api/messages", message);
      return response.json();
    },
    onSuccess: () => {
      // Invalider la requête des messages pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContact?.id] });
      setMessageText("");
    },
  });

  // Filtrer les contacts en fonction de la recherche
  const filteredContacts = contacts?.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Défilement automatique vers le bas des messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Marquer les messages comme lus lorsqu'un contact est sélectionné
  useEffect(() => {
    if (selectedContact && user) {
      // Appel à l'API pour marquer les messages comme lus
      const markAsRead = async () => {
        try {
          await apiRequest("POST", `/api/messages/read/${selectedContact.id}`, {});
          // Rafraîchir la liste des contacts pour mettre à jour les compteurs de messages non lus
          queryClient.invalidateQueries({ queryKey: ["/api/student/contacts"] });
        } catch (error) {
          console.error("Erreur lors du marquage des messages comme lus:", error);
        }
      };
      
      markAsRead();
    }
  }, [selectedContact, user, queryClient]);

  // Gérer l'envoi d'un message
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedContact) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedContact.id,
      content: messageText,
    });
  };

  // Formatage de la date des messages
  const formatMessageTime = (dateValue: string | Date | null) => {
    if (!dateValue) return "";
    
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Aujourd'hui : afficher l'heure uniquement
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Hier
      return `Hier, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      // Cette semaine : jour de la semaine
      return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      // Date complète pour les messages plus anciens
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  return (
    <DashboardLayout title="Messagerie">
      <div className="flex h-[calc(100vh-220px)] bg-white rounded-lg shadow overflow-hidden">
        {/* Liste des contacts */}
        <div className="w-1/3 border-r">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un contact..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoadingContacts ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-y-auto h-full">
              {filteredContacts && filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer flex items-start ${
                      selectedContact?.id === contact.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                        {contact.avatar ? (
                          <img src={contact.avatar} alt={contact.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <UserIcon className="h-6 w-6" />
                        )}
                      </div>
                      {(contact.unreadCount && contact.unreadCount > 0) && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{contact.name}</h4>
                        {contact.lastMessageTime && (
                          <span className="text-xs text-gray-500">{formatMessageTime(contact.lastMessageTime)}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {contact.lastMessage || `${contact.userType === "COMPANY" ? "Entreprise" : "École"}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p>Aucun contact trouvé</p>
                  <p className="text-sm mt-1">
                    {searchQuery ? "Essayez une autre recherche" : "Vous n'avez pas encore de contacts"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Zone de conversation */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* En-tête du contact */}
              <div className="p-4 border-b flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                  {selectedContact.avatar ? (
                    <img src={selectedContact.avatar} alt={selectedContact.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedContact.userType === "COMPANY" ? "Entreprise" : "École"}
                  </p>
                </div>
              </div>
              
              {/* Messages */}
              <div
                ref={messageContainerRef}
                className="flex-1 p-4 overflow-y-auto"
              >
                {isLoadingMessages ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
                        <div className={`max-w-[70%] ${i % 2 === 0 ? "bg-blue-100" : "bg-gray-100"} rounded-lg p-3`}>
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-20 mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isCurrentUser = message.senderId === user?.id;
                      return (
                        <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : ""}`}>
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isCurrentUser
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 text-right ${isCurrentUser ? "text-blue-200" : "text-gray-500"}`}>
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="bg-gray-100 rounded-full p-4 mb-3">
                      <Send className="h-6 w-6" />
                    </div>
                    <p>Aucun message</p>
                    <p className="text-sm">Envoyez votre premier message à {selectedContact.name}</p>
                  </div>
                )}
              </div>
              
              {/* Zone de saisie */}
              <div className="p-4 border-t">
                <div className="flex">
                  <Input
                    placeholder="Tapez votre message..."
                    className="flex-1"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    onClick={handleSendMessage}
                    className="ml-2"
                  >
                    {sendMessageMutation.isPending ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <Send className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-medium text-gray-700 mb-2">Bienvenue dans votre messagerie</h2>
              <p className="max-w-md">
                Sélectionnez un contact dans la liste pour commencer une conversation ou retrouver vos échanges précédents.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}