import { FileUpload } from "@/components/FileUpload";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
            File Import Service
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Securely upload your files to our S3 storage. Drag and drop your documents, images, or archives below.
          </p>
        </div>
        
        <FileUpload />

        <div className="text-center text-sm text-gray-400 mt-12">
          &copy; {new Date().getFullYear()} File Import Service using Next.js & S3
        </div>
      </div>
    </main>
  );
}
