import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Contact {
  id: number;
  name: string;
  email: string;
  userType: string;
  profileId: number;
  avatar?: string | null;
  unreadCount: number;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  createdAt: Date;
}

interface ConversationViewProps {
  selectedContact: Contact | null;
}

export function ConversationView({ selectedContact }: ConversationViewProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Récupérer les messages pour la conversation sélectionnée
  const { data: conversation, isLoading } = useQuery({
    queryKey: ['/api/conversations', selectedContact?.id],
    enabled: !!selectedContact && !!user,
  });
  
  // Mutation pour envoyer un nouveau message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedContact) throw new Error("Aucun contact sélectionné");
      
      const res = await apiRequest('POST', `/api/conversations/${selectedContact.id}`, { content });
      return await res.json();
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedContact?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Erreur d'envoi de message:", error);
    }
  });
  
  // Marquer les messages comme lus
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest('PUT', `/api/messages/${messageId}/read`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedContact?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    }
  });
  
  // Faire défiler automatiquement vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  // Marquer les messages non lus comme lus lorsqu'ils sont visibles
  useEffect(() => {
    if (conversation?.messages && user) {
      conversation.messages.forEach((message: Message) => {
        if (message.receiverId === user.id && !message.isRead) {
          markAsReadMutation.mutate(message.id);
        }
      });
    }
  }, [conversation, user]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate(newMessage);
  };
  
  if (!selectedContact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-muted-foreground">
          Sélectionnez une conversation pour commencer à discuter
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="ml-4">
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${i % 2 === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* En-tête de la conversation */}
      <div className="border-b p-4 flex items-center">
        <div className="relative">
          {selectedContact.avatar ? (
            <Avatar>
              <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
              <AvatarFallback>{selectedContact.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar>
              <AvatarFallback>{selectedContact.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className="ml-4">
          <div className="font-medium">{selectedContact.name}</div>
          <div className="text-xs text-muted-foreground">{selectedContact.email}</div>
        </div>
      </div>
      
      {/* Zone des messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversation?.messages?.length > 0 ? (
            conversation.messages.map((message: Message) => {
              const isSender = message.senderId === user?.id;
              const formattedTime = formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
                locale: fr
              });
              
              return (
                <div key={message.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isSender 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-muted rounded-tl-none'
                    }`}
                  >
                    <div className="break-words">{message.content}</div>
                    <div className="text-xs mt-1 opacity-70 text-right">{formattedTime}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Aucun message. Commencez une conversation !
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Formulaire d'envoi de message */}
      <form onSubmit={handleSendMessage} className="border-t p-4 flex items-end">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez un message..."
          className="flex-1 resize-none"
          rows={2}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="ml-2"
          disabled={sendMessageMutation.isPending || !newMessage.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}