import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, Login, StudentRegistration, CompanyRegistration, SchoolRegistration, UserType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: User | null;
  userProfile: any | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, Login>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, any>;
  studentRegisterMutation: UseMutationResult<any, Error, StudentRegistration>;
  companyRegisterMutation: UseMutationResult<any, Error, CompanyRegistration>;
  schoolRegisterMutation: UseMutationResult<any, Error, SchoolRegistration>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const {
    data: userData,
    error,
    isLoading,
  } = useQuery<any | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("http://localhost:8080/api/user", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          method: "GET",
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        return await res.json();
      } catch (error) {
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: Login) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      const userType = data.user.userType;
      switch (userType) {
        case UserType.STUDENT:
          navigate("/student/dashboard");
          break;
        case UserType.COMPANY:
          navigate("/company/dashboard");
          break;
        case UserType.SCHOOL:
          navigate("/school/dashboard");
          break;
        default:
          navigate("/");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const studentRegisterMutation = useMutation({
    mutationFn: async (data: StudentRegistration) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Registration successful",
        description: "Welcome to Intega!",
      });
      navigate("/student/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const companyRegisterMutation = useMutation({
    mutationFn: async (data: CompanyRegistration) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Registration successful",
        description: "Welcome to Intega!",
      });
      navigate("/company/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const schoolRegisterMutation = useMutation({
    mutationFn: async (data: SchoolRegistration) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Registration successful",
        description: "Welcome to Intega!",
      });
      navigate("/school/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      console.log("Starting registration with:", {
        ...(typeof data === "object" && data !== null ? data : {}),
        password: "******" // Hide sensitive data
      });
  
      try {
        const startTime = Date.now();
        const res = await fetch("http://localhost:8080/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data)
        });
        
        console.log(`Request took ${Date.now() - startTime}ms`);
  
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Server error response:", {
            status: res.status,
            statusText: res.statusText,
            errorData
          });
          throw new Error(errorData.message || `HTTP ${res.status}`);
        }
  
        const responseData = await res.json();
        console.log("Registration response:", responseData);
        return responseData;
      } catch (error) {
        console.error("Network error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Registration success:", data);
      if (data?.user) {
        navigate(`/${data.user.userType.toLowerCase()}/dashboard`);
      }
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/auth");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const user = userData?.user || null;
  const userProfile = userData?.profile || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        studentRegisterMutation,
        companyRegisterMutation,
        schoolRegisterMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
