import * as React from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface DocumentDropzoneProps {
  onUpload: (file: File) => void | Promise<any>;
  isUploading: boolean;
  progress: number;
  className?: string;
}

const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt", "md"];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  onUpload,
  isUploading,
  progress,
  className = "",
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateAndUpload = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(`Unsupported format ".${ext}". Please upload PDF, DOCX, TXT, or MD.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Limit is 15MB.`);
      return;
    }

    void onUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndUpload(file);
      // Reset input value so re-selecting same file triggers change
      e.target.value = "";
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition-all ${
        isDragOver
          ? "border-primary-500 bg-primary-50/50 scale-[1.005]"
          : "border-neutral-200/90 bg-neutral-50/50 hover:border-primary-400 hover:bg-neutral-50"
      } ${isUploading ? "pointer-events-none opacity-80" : ""} ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        id="kb-file-upload"
        aria-label="Upload document"
        accept=".pdf,.docx,.txt,.md"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <div className="flex flex-col items-center justify-center space-y-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-colors ${
            isDragOver ? "bg-primary-600 text-white" : "bg-white text-primary-600 border border-neutral-200/70"
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {isUploading ? "Uploading and indexing document..." : "Drag and drop project documents, or browse"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            PDF, DOCX, TXT, MD up to 15MB. Automatically segmented and vectorized for AI Copilot.
          </p>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="w-full max-w-xs space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-600">
              <span>Uploading and queueing for ingestion... {progress}%</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-primary-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
