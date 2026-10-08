import * as React from "react";
import { Upload, Trash2, Info, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import nexoraLogoSrc from "@/assets/logo/logo.png";
import type { AvatarSectionProps } from "@/types";

export const AvatarSection: React.FC<AvatarSectionProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  disabled = false,
}) => {
  const [showUrlDialog, setShowUrlDialog] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState(currentAvatarUrl || "");
  const [urlError, setUrlError] = React.useState("");

  const handleApplyUrl = () => {
    setUrlError("");
    const trimmed = urlInput.trim();
    if (!trimmed) {
      onAvatarChange(null);
      setShowUrlDialog(false);
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setUrlError("URL must start with http:// or https://");
        return;
      }
      onAvatarChange(trimmed);
      setShowUrlDialog(false);
    } catch {
      setUrlError("Please enter a valid image URL");
    }
  };

  const handleRemove = () => {
    onAvatarChange(null);
    setUrlInput("");
    setShowUrlDialog(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Avatar Display */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-2 shadow-xs select-none">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="Profile avatar"
              className="h-full w-full rounded-xl object-cover"
              onError={(e) => {
                // Fallback to logo on broken image URL
                (e.currentTarget as HTMLImageElement).src = nexoraLogoSrc;
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1">
              <img
                src={nexoraLogoSrc}
                alt="Nexora default avatar"
                className="h-10 w-10 object-contain"
              />
              <span className="text-[10px] font-semibold text-neutral-400">
                Nexora
              </span>
            </div>
          )}
        </div>

        {/* Avatar Controls */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => {
                setUrlInput(currentAvatarUrl || "");
                setUrlError("");
                setShowUrlDialog(true);
              }}
              className="h-8 gap-1.5 rounded-lg border-neutral-200 bg-neutral-50/80 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Upload className="h-3.5 w-3.5 text-neutral-500" />
              <span>Change photo</span>
            </Button>

            {currentAvatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={handleRemove}
                className="h-8 gap-1 rounded-lg px-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </Button>
            )}
          </div>

          <p className="text-xs text-neutral-500 leading-normal">
            JPG, PNG or WEBP. Recommended size: 256 × 256 px. Maximum 5MB.
          </p>
        </div>
      </div>

      {/* Optional URL Entry Modal for Swagger-compliant avatarUrl */}
      {showUrlDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowUrlDialog(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-neutral-200/80 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <LinkIcon className="h-5 w-5" />
              </div>
              <div>
                <h3
                  id="avatar-dialog-title"
                  className="text-base font-bold text-neutral-900"
                >
                  Change Profile Photo
                </h3>
                <p className="text-xs text-neutral-500">
                  Enter an image URL for your profile avatar
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label
                htmlFor="avatar-url-input"
                className="block text-xs font-semibold text-neutral-700"
              >
                Image URL (HTTPS)
              </label>
              <input
                id="avatar-url-input"
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError("");
                }}
                placeholder="https://example.com/avatar.png"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {urlError && <p className="text-xs text-error-500">{urlError}</p>}
              <div className="flex items-start gap-1.5 pt-1 text-[11px] text-neutral-500">
                <Info className="h-3.5 w-3.5 shrink-0 text-neutral-400 mt-0.5" />
                <span>
                  Provide a direct URL to a JPEG, PNG, or WEBP image. Direct file
                  uploading will be enabled once Cloudinary integration is active.
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-neutral-200 text-xs"
                onClick={() => setShowUrlDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs shadow-xs"
                onClick={handleApplyUrl}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Apply URL</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
