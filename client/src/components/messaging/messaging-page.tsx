import React, { useState } from 'react';
import { ConversationList } from './conversation-list';
import { ConversationView } from './conversation-view';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface Contact {
  id: number;
  name: string;
  email: string;
  userType: string;
  profileId: number;
  avatar?: string | null;
  unreadCount: number;
}

export function MessagingPage() {
  const { user, isLoading } = useAuth();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Accès non autorisé</h2>
        <p className="text-muted-foreground mb-8">
          Vous devez être connecté pour accéder à la messagerie.
        </p>
        <Button asChild>
          <Link href="/auth">Se connecter</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Messagerie</h1>
      
      <div className="bg-card border rounded-lg shadow-sm flex h-[calc(100vh-200px)] overflow-hidden">
        {/* Liste des conversations */}
        <div className="w-1/3 border-r">
          <ConversationList 
            onSelectContact={setSelectedContact}
            selectedContactId={selectedContact?.id}
          />
        </div>
        
        {/* Vue de la conversation */}
        <div className="w-2/3 flex flex-col">
          <ConversationView selectedContact={selectedContact} />
        </div>
      </div>
    </div>
  );
}