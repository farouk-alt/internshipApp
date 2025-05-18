import React from "react";

export const IntegaLogo = () => {
  return (
    <div className="relative mr-4">
      <svg width="35" height="35" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-shadow">
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
};