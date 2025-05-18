import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { UserType } from "@shared/schema";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail,
  User,
  LogIn,
  UserPlus,
  GraduationCap, 
  Building2, 
  Building,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formFadeIn, setFormFadeIn] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  useEffect(() => {
    // If user is logged in, redirect to home
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  useEffect(() => {
    setFormFadeIn(false);
    const timer = setTimeout(() => {
      setFormFadeIn(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let score = 0;
    
    // Length check
    if (password.length > 6) score += 20;
    if (password.length > 10) score += 10;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    
    // Mixed character types
    const variations = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ].filter(Boolean).length;
    
    score += (variations - 1) * 10;
    
    return Math.min(100, score);
  };

  // Form validation schemas
  const loginSchema = z.object({
    email: z.string().min(1, "L'email est requis"),
    password: z.string().min(1, "Le mot de passe est requis"),
  });

  const registerSchema = z.object({
    email: z.string().email("Email invalide").min(1, "L'email est requis"),
    username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
    userType: z.enum([UserType.STUDENT, UserType.COMPANY, UserType.SCHOOL])
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

  // Form setup
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      userType: UserType.STUDENT,
    },
  });

  // Form submission handlers
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    // Format data to match backend expectations
    const registrationData = {
      userType: values.userType,
      email: values.email,
      username: values.username,
      password: values.password,
      // Include these only if your backend expects them
      // firstName: values.firstName || values.username,
      // lastName: values.lastName || 'User'
    };
  
    console.log("Final registration payload:", registrationData);
    
    try {
      const response = await registerMutation.mutateAsync(registrationData);
      console.log("Registration success:", response);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };
  const userCards = [
    {
      title: "Pour les étudiants",
      icon: <GraduationCap className="h-6 w-6 text-white" />,
      description: "Accédez à des offres de stages pertinentes et gérez vos candidatures en toute simplicité.",
      userType: UserType.STUDENT,
    },
    {
      title: "Pour les entreprises",
      icon: <Building2 className="h-6 w-6 text-white" />,
      description: "Publiez des offres et trouvez les meilleurs talents pour vos stages grâce à notre plateforme intuitive.",
      userType: UserType.COMPANY,
    },
    {
      title: "Pour les écoles",
      icon: <Building className="h-6 w-6 text-white" />,
      description: "Suivez vos étudiants et validez les offres de stage de vos partenaires avec un contrôle total.",
      userType: UserType.SCHOOL,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left side - App info */}
      <div className="lg:w-1/2 intega-blue-bg text-white p-6 lg:p-12 relative">
        {/* Animated shapes */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-white/5 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000"></div>
        
        {/* Content */}
        <div className="z-10 relative">
          <div className="mb-8 flex items-center">
            <div className="relative mr-4">
              <svg width="45" height="45" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-shadow">
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
            <h1 className="text-4xl font-bold tracking-tight">Intega</h1>
          </div>
          
          <h2 className="text-3xl font-semibold mb-4">Simplifiez la gestion de vos stages</h2>
          <p className="text-xl mb-12 opacity-90 leading-relaxed max-w-xl">
            Intega met en relation étudiants, écoles et entreprises pour faciliter le processus de recherche et de gestion de stages dans un environnement unique et intuitif.
          </p>
          
          <div className="space-y-6 mt-12">
            {userCards.map((card, index) => (
              <div 
                key={index}
                className={`user-card p-6 transition-all duration-300 cursor-pointer ${activeCardIndex === index ? 'bg-white/25' : ''}`}
                onClick={() => {
                  setActiveCardIndex(index);
                  registerForm.setValue("userType", card.userType);
                }}
                onMouseEnter={() => setActiveCardIndex(index)}
                onMouseLeave={() => setActiveCardIndex(null)}
              >
                <div className="flex items-center mb-3">
                  <div className="icon-container">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                </div>
                <p className="text-white/90 ml-[52px] text-lg">
                  {card.description}
                </p>
                
                <div className={`ml-[52px] mt-3 flex items-center transition-all duration-300 ${activeCardIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="text-white font-medium mr-2">En savoir plus</span>
                  <ChevronRight className="h-5 w-5 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">Bienvenue sur Intega</h2>
            <p className="text-gray-600 mt-2">La plateforme qui transforme la gestion des stages</p>
          </div>

          <div className="mb-8 flex justify-center space-x-4">
            <Button
              variant="outline"
              className={`px-8 py-2.5 text-base rounded-full ${activeTab === 'login' ? 'bg-primary-gradient text-white shadow-lg border-none' : 'bg-white text-gray-600 border-gray-200'}`}
              onClick={() => setActiveTab('login')}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Connexion
            </Button>
            <Button
              variant="outline"
              className={`px-8 py-2.5 text-base rounded-full ${activeTab === 'register' ? 'bg-primary-gradient text-white shadow-lg border-none' : 'bg-white text-gray-600 border-gray-200'}`}
              onClick={() => setActiveTab('register')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Inscription
            </Button>
          </div>
          
          <div className="bg-card-gradient p-8 rounded-2xl backdrop-blur-md">
            {/* Login Form */}
            {activeTab === "login" && (
              <div className={`${formFadeIn ? 'animate-fadeIn' : 'opacity-0'}`}>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700 font-medium text-base mb-2">
                            <Mail className="h-5 w-5 mr-2 text-blue-500" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="johndoe@example.com" 
                              className="py-6 px-5 rounded-xl glass-input text-base"
                              {...field} 
                              type="email"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-red-500 mt-1">Attention : seule l'adresse email complète est acceptée (ex: procheck@gmail.com)</p>
                        </FormItem>
                      )}
                    />
                  
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700 font-medium text-base mb-2">
                            <Lock className="h-5 w-5 mr-2 text-blue-500" />
                            Mot de passe
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••"
                                className="py-6 px-5 rounded-xl glass-input text-base"
                                {...field} 
                              />
                              <button 
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Checkbox id="remember" className="mr-2 rounded"/>
                        <label 
                          htmlFor="remember" 
                          className="text-sm text-gray-600"
                        >
                          Se souvenir de moi
                        </label>
                      </div>
                      <a 
                        href="#" 
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Mot de passe oublié?
                      </a>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full py-6 text-base font-medium login-button rounded-xl text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        "Connexion en cours..."
                      ) : (
                        <>
                          Se connecter
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    <div className="text-center text-sm text-gray-600 mt-6">
                      Pas encore de compte? <a href="#" onClick={() => setActiveTab("register")} className="text-blue-600 hover:underline font-medium">S'inscrire</a>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <div className={`${formFadeIn ? 'animate-fadeIn' : 'opacity-0'}`}>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700 font-medium text-base mb-2">
                            <Mail className="h-5 w-5 mr-2 text-blue-500" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="email@example.com" 
                              className="py-6 px-5 rounded-xl glass-input text-base"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700 font-medium text-base mb-2">
                            <User className="h-5 w-5 mr-2 text-blue-500" />
                            Nom d'utilisateur
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="johndoe"
                              className="py-6 px-5 rounded-xl glass-input text-base"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700 font-medium text-base mb-2">
                            <Lock className="h-5 w-5 mr-2 text-blue-500" />
                            Mot de passe
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••"
                                className="py-6 px-5 rounded-xl glass-input text-base"
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  setPasswordStrength(calculatePasswordStrength(e.target.value));
                                }}
                              />
                              <button 
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          
                          {/* Password strength indicator */}
                          <div className="mt-2">
                            <Progress value={passwordStrength} className="h-1.5 bg-gray-200" />
                            <div className="flex justify-between mt-1 text-xs">
                              <span className={passwordStrength > 0 ? "text-gray-700 font-medium" : "text-gray-400"}>Faible</span>
                              <span className={passwordStrength >= 50 ? "text-gray-700 font-medium" : "text-gray-400"}>Moyen</span>
                              <span className={passwordStrength >= 75 ? "text-gray-700 font-medium" : "text-gray-400"}>Fort</span>
                            </div>
                          </div>
                          
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700 font-medium text-base mb-2">
                            <Lock className="h-5 w-5 mr-2 text-blue-500" />
                            Confirmer le mot de passe
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="••••••••"
                                className="py-6 px-5 rounded-xl glass-input text-base"
                                {...field} 
                              />
                              <button 
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700 font-medium text-base mb-2">
                            <User className="h-5 w-5 mr-2 text-blue-500" />
                            S'inscrire en tant que
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-3 gap-3 mt-2">
                              <Button
                                type="button"
                                variant={field.value === UserType.STUDENT ? "default" : "outline"}
                                onClick={() => registerForm.setValue("userType", UserType.STUDENT)}
                                className={`w-full rounded-xl py-4 flex items-center justify-center ${field.value === UserType.STUDENT ? "bg-primary-gradient text-white" : "border-gray-200"}`}
                              >
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Étudiant
                              </Button>
                              <Button
                                type="button"
                                variant={field.value === UserType.COMPANY ? "default" : "outline"}
                                onClick={() => registerForm.setValue("userType", UserType.COMPANY)}
                                className={`w-full rounded-xl py-4 flex items-center justify-center ${field.value === UserType.COMPANY ? "bg-primary-gradient text-white" : "border-gray-200"}`}
                              >
                                <Building2 className="h-4 w-4 mr-2" />
                                Entreprise
                              </Button>
                              <Button
                                type="button"
                                variant={field.value === UserType.SCHOOL ? "default" : "outline"}
                                onClick={() => registerForm.setValue("userType", UserType.SCHOOL)}
                                className={`w-full rounded-xl py-4 flex items-center justify-center ${field.value === UserType.SCHOOL ? "bg-primary-gradient text-white" : "border-gray-200"}`}
                              >
                                <Building className="h-4 w-4 mr-2" />
                                École
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full py-6 text-base font-medium login-button rounded-xl text-white mt-6"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        "Inscription en cours..."
                      ) : (
                        <>
                          Créer mon compte
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    <div className="text-center text-sm text-gray-600 mt-6">
                      Déjà inscrit? <a href="#" onClick={() => setActiveTab("login")} className="text-blue-600 hover:underline font-medium">Se connecter</a>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}