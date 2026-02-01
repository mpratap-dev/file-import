"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, CheckCircle, XCircle, File as FileIcon, Loader2 } from "lucide-react";
import { getPresignedUrl } from "@/app/actions";
import { Button, cn } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStatus("idle");
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
  });

  const uploadFile = async () => {
    /* istanbul ignore next */
    if (!file) return;

    setStatus("uploading");
    setUploadProgress(10);

    try {
      // 1. Get Presigned URL
      const { success, url, error } = await getPresignedUrl(file.name, file.type);
      
      if (!success || !url) {
        throw new Error(error || "Failed to get upload URL");
      }

      setUploadProgress(40);

      // 2. Upload to S3
      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Upload to S3 failed");
      }

      setUploadProgress(100);
      setStatus("success");
      
      setTimeout(() => {
        setFile(null);
        setStatus("idle");
        setUploadProgress(0);
      }, 3000);

    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto p-6 border-gray-100 shadow-xl">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer",
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
          status === "uploading" && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <FileIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-gray-100 rounded-full animate-bounce-slow">
              <CloudUpload className="w-10 h-10 text-gray-500" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports all file types up to 5GB
              </p>
            </div>
          </div>
        )}
      </div>

      {file && status !== "success" && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              uploadFile();
            }}
            disabled={status === "uploading"}
            className="flex items-center gap-2"
          >
            {status === "uploading" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : status === "error" ? (
              <>Retry Upload</>
            ) : (
                "Upload File"
            )}
          </Button>
        </div>
      )}

      {status === "success" && (
        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <span className="font-medium">File uploaded successfully!</span>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <XCircle className="w-6 h-6 text-red-500" />
          <span className="font-medium">Upload failed. Please try again.</span>
        </div>
      )}
    </Card>
  );
}
