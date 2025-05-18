import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function StudentDashboard() {
  const { user, logoutMutation } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord étudiant</h1>
      <p className="mb-4">Bienvenue, {user?.email}</p>
      
      <button 
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => logoutMutation.mutate()}
      >
        Déconnexion
      </button>
      
      <div className="mt-4 p-4 bg-yellow-100 rounded">
        <p>Cette page est une version simplifiée temporaire pendant que nous réparons le tableau de bord complet.</p>
      </div>
    </div>
  );
}