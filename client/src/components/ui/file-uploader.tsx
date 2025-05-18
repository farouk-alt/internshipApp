import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, X, File, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onUpload: (file: File, metadata: {name: string, type: string}) => Promise<void>;
  allowedTypes?: string[];
  maxSizeMB?: number;
  className?: string;
  documentType: string;
}

export function FileUploader({
  onUpload,
  allowedTypes = [".pdf", ".doc", ".docx", ".txt"],
  maxSizeMB = 5,
  className,
  documentType,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const { toast } = useToast();
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size should be less than ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return false;
    }
    
    // Check file type
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: `File must be one of: ${allowedTypes.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setFileName(droppedFile.name);
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      }
    }
  };
  
  const handleRemoveFile = () => {
    setFile(null);
    setFileName("");
    setUploadComplete(false);
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      await onUpload(file, {
        name: fileName,
        type: documentType
      });
      
      setProgress(100);
      setUploadComplete(true);
      
      toast({
        title: "Upload successful",
        description: `${fileName} has been uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  };
  
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        {!file ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center",
              dragActive ? "border-primary bg-primary-50" : "border-gray-300"
            )}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
            <p className="mb-2 text-sm font-medium text-gray-700">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Supported formats: {allowedTypes.join(", ")} (max {maxSizeMB}MB)
            </p>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept={allowedTypes.join(",")}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Browse Files
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-50 rounded-md">
                  <File className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">{fileName}</p>
                  <p className="text-xs text-gray-500">{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ""}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="h-8 w-8 p-0"
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {uploading || uploadComplete ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">
                    {uploadComplete ? "Upload complete" : "Uploading..."}
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                
                {uploadComplete && (
                  <div className="flex items-center text-green-500 text-sm mt-2">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span>File uploaded successfully</span>
                  </div>
                )}
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleUpload}
              >
                Upload File
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
