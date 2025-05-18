import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, User, Search, ArrowLeft, Send, 
  Phone, Video, MoreVertical, Paperclip, Image, 
  FileText, Mic, MessageSquare, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: Date;
  read: boolean;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  userType: string;
  profileId: number;
  avatar?: string;
  unreadCount: number;
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
}

const IntegaLogo = () => (
  <div className="w-8 h-8 mr-2 rounded-md bg-primary-gradient flex items-center justify-center logo-shadow">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 10V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

// Mock data for demonstration
const mockContacts: Contact[] = [
  { 
    id: 1, 
    name: "TechArabia", 
    email: "contact@techarabia.com", 
    userType: "COMPANY", 
    profileId: 101,
    unreadCount: 2,
    lastMessage: {
      content: "Nous serions intéressés par le profil de votre étudiant Mohammed.",
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 min ago
    }
  },
  { 
    id: 2, 
    name: "DesignMaghreb", 
    email: "info@designmaghreb.com", 
    userType: "COMPANY", 
    profileId: 102,
    unreadCount: 0,
    lastMessage: {
      content: "Merci pour les informations sur votre programme de stages.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
    }
  },
  { 
    id: 3, 
    name: "Mohammed Al-Hassan", 
    email: "mohammed@student.com", 
    userType: "STUDENT", 
    profileId: 201,
    unreadCount: 1,
    lastMessage: {
      content: "J'ai envoyé ma candidature pour le stage chez TechArabia.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    }
  },
  { 
    id: 4, 
    name: "Fatima El-Zahra", 
    email: "fatima@student.com", 
    userType: "STUDENT", 
    profileId: 202,
    unreadCount: 0,
    lastMessage: {
      content: "Je vous remercie pour votre aide avec mon CV.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    }
  }
];

const mockMessages: Record<number, Message[]> = {
  1: [
    { 
      id: 101, 
      senderId: 1, 
      receiverId: 999, // Current user ID 
      content: "Bonjour, nous sommes à la recherche de stagiaires en développement web pour cet été.", 
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), 
      read: true 
    },
    { 
      id: 102, 
      senderId: 999, // Current user ID
      receiverId: 1, 
      content: "Bonjour, merci pour votre message. Nous avons plusieurs étudiants qui seraient intéressés par cette opportunité.", 
      createdAt: new Date(Date.now() - 1000 * 60 * 60), 
      read: true 
    },
    { 
      id: 103, 
      senderId: 1, 
      receiverId: 999, // Current user ID
      content: "Excellent ! Pourriez-vous nous envoyer leurs profils ?", 
      createdAt: new Date(Date.now() - 1000 * 60 * 45), 
      read: true 
    },
    { 
      id: 104, 
      senderId: 999, // Current user ID
      receiverId: 1, 
      content: "Bien sûr, je vous partagerai ces informations d'ici demain.", 
      createdAt: new Date(Date.now() - 1000 * 60 * 40), 
      read: true 
    },
    { 
      id: 105, 
      senderId: 1, 
      receiverId: 999, // Current user ID
      content: "Nous serions intéressés par le profil de votre étudiant Mohammed.", 
      createdAt: new Date(Date.now() - 1000 * 60 * 30), 
      read: false 
    }
  ],
  // Other conversation messages would be here
};

export default function MessagingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set document title
    document.title = "Messagerie - Intega";
  }, []);

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // In a real app, this would fetch messages from the API
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ['messages', activeContact?.id],
    queryFn: async () => {
      if (!activeContact) return [];
      
      // In a real app, this would be:
      // const res = await apiRequest('GET', `/api/messages/conversation/${activeContact.id}`);
      // return await res.json();
      
      // For now, return mock data
      return mockMessages[activeContact.id] || [];
    },
    enabled: !!activeContact
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeContact) throw new Error("No active contact");
      
      // In a real app, this would be:
      // const res = await apiRequest('POST', '/api/messages', {
      //   receiverId: activeContact.id,
      //   content
      // });
      // return await res.json();
      
      // For now, simulate sending a message
      const newMsg: Message = {
        id: Math.floor(Math.random() * 10000),
        senderId: user?.id || 999,
        receiverId: activeContact.id,
        content,
        createdAt: new Date(),
        read: false
      };
      
      // Update mock data
      if (mockMessages[activeContact.id]) {
        mockMessages[activeContact.id].push(newMsg);
      } else {
        mockMessages[activeContact.id] = [newMsg];
      }
      
      return newMsg;
    },
    onSuccess: () => {
      // Clear the input
      setNewMessage('');
      
      // Invalidate queries to refresh the message list
      queryClient.invalidateQueries({ queryKey: ['messages', activeContact?.id] });
      
      // Update the last message in the contact list
      setContacts(prev => 
        prev.map(contact => 
          contact.id === activeContact?.id 
            ? { 
                ...contact, 
                lastMessage: { 
                  content: newMessage, 
                  createdAt: new Date() 
                } 
              }
            : contact
        )
      );
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openConversation = (contact: Contact) => {
    setActiveContact(contact);
    
    // Mark messages as read
    if (contact.unreadCount > 0) {
      // Update the unread count
      setContacts(prev => 
        prev.map(c => 
          c.id === contact.id 
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
      
      // In a real app, this would call the API to mark messages as read
      // apiRequest('PUT', `/api/messages/read/${contact.id}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <IntegaLogo />
            <h1 className="text-xl font-bold text-gray-900">Intega</h1>
          </div>
        </Link>
        <div className="ml-auto flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary-gradient text-white">
              {user?.username?.substring(0, 2).toUpperCase() || "IN"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden max-h-[calc(100vh-120px)]">
        {/* Contacts sidebar */}
        <div className="w-80 border-r bg-white flex flex-col max-h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-2">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher des contacts..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full justify-start px-4 pt-2">
              <TabsTrigger value="all" className="flex-1">Tous</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">Non lus</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="all" className="m-0 h-full overflow-auto">
                <div className="divide-y">
                  {filteredContacts.map(contact => (
                    <div 
                      key={contact.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${activeContact?.id === contact.id ? 'bg-blue-50' : ''}`}
                      onClick={() => openConversation(contact)}
                    >
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                          <AvatarImage src={contact.avatar || ""} />
                          <AvatarFallback className={`${contact.userType === 'COMPANY' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                            {contact.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {format(new Date(contact.lastMessage.createdAt), 'HH:mm')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            {contact.lastMessage && (
                              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                {contact.lastMessage.content}
                              </p>
                            )}
                            {contact.unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {contact.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredContacts.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      Aucun contact trouvé
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="unread" className="m-0 h-full overflow-auto">
                <div className="divide-y">
                  {filteredContacts.filter(c => c.unreadCount > 0).map(contact => (
                    <div 
                      key={contact.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${activeContact?.id === contact.id ? 'bg-blue-50' : ''}`}
                      onClick={() => openConversation(contact)}
                    >
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                          <AvatarImage src={contact.avatar || ""} />
                          <AvatarFallback className={`${contact.userType === 'COMPANY' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                            {contact.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {format(new Date(contact.lastMessage.createdAt), 'HH:mm')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            {contact.lastMessage && (
                              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                {contact.lastMessage.content}
                              </p>
                            )}
                            {contact.unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {contact.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredContacts.filter(c => c.unreadCount > 0).length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      Aucun message non lu
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        {/* Conversation area */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {activeContact ? (
            <>
              {/* Conversation header */}
              <div className="bg-white p-4 shadow-sm flex items-center justify-between border-b">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={activeContact.avatar || ""} />
                    <AvatarFallback className={`${activeContact.userType === 'COMPANY' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {activeContact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{activeContact.name}</h3>
                    <p className="text-xs text-gray-500">{activeContact.userType === 'COMPANY' ? 'Entreprise' : 'Étudiant'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-4 flex flex-col-reverse">
                    {messagesData?.slice().reverse().map(message => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[75%] px-4 py-2 rounded-lg ${
                            message.senderId === user?.id 
                              ? 'bg-blue-500 text-white rounded-br-none' 
                              : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p>{message.content}</p>
                          <div 
                            className={`text-xs mt-1 ${
                              message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      placeholder="Écrivez votre message..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 py-2 min-h-[40px] max-h-[120px] overflow-y-auto"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                    />
                    <div className="absolute right-2 bottom-2">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    className="rounded-full bg-blue-500 hover:bg-blue-600 h-10 w-10 flex-shrink-0"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    onClick={handleSendMessage}
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-start mt-2 space-x-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500">
                    <Image className="h-4 w-4 mr-1" />
                    Image
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500">
                    <FileText className="h-4 w-4 mr-1" />
                    Document
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500">
                    <Mic className="h-4 w-4 mr-1" />
                    Audio
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="p-6 rounded-full bg-blue-50 mb-4">
                <MessageSquare className="h-10 w-10 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Votre messagerie</h2>
              <p className="text-gray-500 max-w-md">
                Sélectionnez une conversation pour commencer à discuter ou recherchez un contact pour entamer une nouvelle discussion.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}