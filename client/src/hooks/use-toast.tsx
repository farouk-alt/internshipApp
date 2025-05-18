// Direct wrapper around Sonner toast for simplicity
import { toast as sonnerToast } from "sonner";
type SonnerToastOptions = {
  // Define the structure of ToastOptions based on its usage or documentation
  description?: string;
  [key: string]: any; // Adjust this as per the actual structure of ToastOptions
};
import { ReactNode } from "react";

export type ToastProps = Omit<SonnerToastOptions, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
};

export interface ToastAPI {
  toast: (props: ToastProps) => void;
  dismiss: (toastId?: string) => void;
}

// Simple wrapper around Sonner toast that can be easily used throughout the app
export const useToast = (): ToastAPI => {
  const toast = ({ title, description, ...props }: ToastProps) => {
    sonnerToast(title as string, {
      ...props,
      description: description as string,
    });
  };

  const dismiss = (toastId?: string) => {
    sonnerToast.dismiss(toastId);
  };

  return {
    toast,
    dismiss,
  };
};