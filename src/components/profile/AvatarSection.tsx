import * as React from "react";
import { Upload, Trash2, Info, Link as LinkIcon, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
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
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* Avatar Display */}
        <div className="shadow-xs relative flex h-24 w-24 shrink-0 select-none items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-2">
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
              <span className="text-[10px] font-semibold text-neutral-400">Nexora</span>
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

          <p className="text-xs leading-normal text-neutral-500">
            JPG, PNG or WEBP. Recommended size: 256 × 256 px. Maximum 5MB.
          </p>
        </div>
      </div>

      <DialogRoot open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent size="sm" aria-labelledby="avatar-dialog-title">
          <DialogHeader>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="text-primary-600 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                <LinkIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <DialogTitle
                  id="avatar-dialog-title"
                  className="text-base font-bold text-neutral-900"
                >
                  Change Profile Photo
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-neutral-500">
                  Enter an image URL for your profile avatar.
                </DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close profile photo dialog"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogClose>
          </DialogHeader>

          <DialogBody className="space-y-3">
            <label
              htmlFor="avatar-url-input"
              className="block space-y-1.5 text-xs font-semibold text-neutral-700"
            >
              <span>Image URL (HTTPS)</span>
              <input
                id="avatar-url-input"
                type="url"
                value={urlInput}
                onChange={(event) => {
                  setUrlInput(event.target.value);
                  setUrlError("");
                }}
                placeholder="https://example.com/avatar.png"
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </label>
            {urlError && (
              <p role="alert" className="text-sm text-error-600">
                {urlError}
              </p>
            )}
            <div className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
              <span>
                Provide a direct URL to a JPEG, PNG, or WEBP image. Direct file uploading will be
                enabled once Cloudinary integration is active.
              </span>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowUrlDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleApplyUrl}>
              <Check className="h-4 w-4" aria-hidden="true" />
              Apply URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};
