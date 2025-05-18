import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

// Type pour un contact de messagerie
interface Contact {
  id: number;
  name: string;
  email: string;
  userType: string;
  profileId: number;
  avatar?: string | null;
  unreadCount: number;
  lastMessage?: {
    content: string;
    createdAt: Date;
  }
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  createdAt: Date;
}

interface ConversationListProps {
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: number;
}

export function ConversationList({ onSelectContact, selectedContactId }: ConversationListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Récupérer tous les messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !!user
  });
  
  // Récupérer la liste des contacts (personnes avec qui l'utilisateur a échangé des messages)
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!messagesLoading && messages) {
      extractContacts(messages);
    }
  }, [messages, messagesLoading]);
  
  // Extraire les contacts uniques à partir des messages
  const extractContacts = async (messages: Message[]) => {
    if (!user || !messages?.length) {
      setIsLoading(false);
      return;
    }
    
    const contactsMap = new Map<number, Contact>();
    const currentUserId = user.id;
    
    // Construire un ensemble des IDs utilisateurs avec qui l'utilisateur actuel a échangé
    const userIds = new Set<number>();
    
    messages.forEach(message => {
      if (message.senderId === currentUserId) {
        userIds.add(message.receiverId);
      } else if (message.receiverId === currentUserId) {
        userIds.add(message.senderId);
      }
    });
    
    // Pour chaque ID utilisateur, récupérer les informations de profil
    const fetchPromises = Array.from(userIds).map(async (userId) => {
      try {
        // Récupérer les détails de l'utilisateur
        const userResponse = await fetch(`http://localhost:8080/api/users/${userId}`);
        if (!userResponse.ok) return null;
        
        const userData = await userResponse.json();
        
        // Calculer le nombre de messages non lus
        const unreadCount = messages.filter(
          (m) => m.senderId === userId && m.receiverId === currentUserId && !m.isRead
        ).length;
        
        // Trouver le dernier message échangé
        const relevantMessages = messages.filter(
          (m) => (m.senderId === userId && m.receiverId === currentUserId) || 
                 (m.senderId === currentUserId && m.receiverId === userId)
        );
        
        const sortedMessages = [...relevantMessages].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        const lastMessage = sortedMessages.length > 0 ? sortedMessages[0] : undefined;
        
        // Déterminer le nom et l'ID du profil en fonction du type d'utilisateur
        let name = userData.username;
        let profileId = userData.id;
        let avatar = null;
        
        if (userData.profile) {
          if (userData.userType === 'SCHOOL') {
            name = userData.profile.name;
            profileId = userData.profile.id;
            avatar = userData.profile.logo;
          } else if (userData.userType === 'COMPANY') {
            name = userData.profile.name;
            profileId = userData.profile.id;
            avatar = userData.profile.logo;
          } else if (userData.userType === 'STUDENT') {
            name = `${userData.profile.firstName} ${userData.profile.lastName}`;
            profileId = userData.profile.id;
            avatar = userData.profile.avatar;
          }
        }
        
        return {
          id: userId,
          name,
          email: userData.email,
          userType: userData.userType,
          profileId,
          avatar,
          unreadCount,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt
          } : undefined
        };
      } catch (error) {
        console.error("Erreur lors de la récupération du contact:", error);
        return null;
      }
    });
    
    const fetchedContacts = (await Promise.all(fetchPromises)).filter(
      (contact): contact is Contact => contact !== null && 'id' in contact && 'name' in contact && 'email' in contact && 'userType' in contact && 'profileId' in contact && 'unreadCount' in contact
    );
    
    // Trier les contacts par date du dernier message
    const sortedContacts = fetchedContacts.sort((a, b) => {
      if (!a || !b || (!a.lastMessage && !b.lastMessage)) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      
      return new Date(b.lastMessage.createdAt).getTime() - 
             new Date(a.lastMessage.createdAt).getTime();
    });
    
    setContacts(sortedContacts);
    setIsLoading(false);
    
    // Si aucun contact n'est sélectionné et qu'il y a des contacts, sélectionner le premier
    if (!selectedContactId && sortedContacts.length > 0) {
      onSelectContact(sortedContacts[0]);
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full h-full space-y-3 p-4">
        <div className="font-semibold text-lg mb-4">Conversations</div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-4 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (contacts.length === 0) {
    return (
      <div className="w-full h-full p-4">
        <div className="font-semibold text-lg mb-4">Conversations</div>
        <div className="text-center text-muted-foreground py-8">
          Aucune conversation
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="font-semibold text-lg p-4 border-b">Conversations</div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {contacts.map((contact) => (
            <Button
              key={contact.id}
              variant={selectedContactId === contact.id ? "secondary" : "ghost"}
              className={`w-full justify-start mb-1 p-3 h-auto ${
                selectedContactId === contact.id ? "bg-secondary" : ""
              }`}
              onClick={() => onSelectContact(contact)}
            >
              <div className="flex items-start w-full">
                <div className="relative flex-shrink-0">
                  {contact.avatar ? (
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {contact.unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                    >
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm truncate">{contact.name}</p>
                    {contact.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(contact.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {contact.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {contact.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}