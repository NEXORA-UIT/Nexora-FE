import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Info, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AvatarSection } from "./AvatarSection";
import { profileSchema } from "@/schemas";
import { profileApi } from "@/apis/profile.api";
import { ApiError } from "@/apis/client";
import { useAuthStore } from "@/stores/auth.store";
import type {
  UserProfile,
  ProfileInformationCardProps,
  ProfileFormData,
} from "@/types";

export const ProfileInformationCard: React.FC<ProfileInformationCardProps> = ({
  user,
  onUpdateSuccess,
}) => {
  const setUser = useAuthStore((state) => state.setUser);

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    user?.avatarUrl ?? null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
    },
  });

  // Sync form when user profile changes
  React.useEffect(() => {
    if (user) {
      reset({ fullName: user.fullName });
      setAvatarUrl(user.avatarUrl ?? null);
    }
  }, [user, reset]);

  const hasAvatarChanged = avatarUrl !== (user?.avatarUrl ?? null);
  const canSave = isDirty || hasAvatarChanged;

  const handleCancel = () => {
    reset({ fullName: user?.fullName || "" });
    setAvatarUrl(user?.avatarUrl ?? null);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const updatedUser = await profileApi.updateProfile({
        fullName: data.fullName.trim(),
        avatarUrl: avatarUrl || null,
      });

      setUser(updatedUser);
      onUpdateSuccess?.(updatedUser);
      setSuccessMessage("Profile information updated successfully.");
      reset({ fullName: updatedUser.fullName });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          // In OpenAPI, PATCH /auth/me is marked planned-cloudinary and may return 404 until server route is deployed
          // We update the local state so the user sees immediate UI reflection without blocking
          if (user) {
            const localUpdated: UserProfile = {
              ...user,
              fullName: data.fullName.trim(),
              avatarUrl: avatarUrl || null,
              updatedAt: new Date().toISOString(),
            };
            setUser(localUpdated);
            onUpdateSuccess?.(localUpdated);
            setSuccessMessage("Profile information updated locally in your session.");
            reset({ fullName: localUpdated.fullName });
            return;
          }
          setErrorMessage(
            "The profile update endpoint is not yet supported by the server."
          );
        } else {
          setErrorMessage(err.message || "Failed to update profile information.");
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs">
      {/* Card Header */}
      <div className="border-b border-neutral-100 pb-5">
        <h2 className="text-base font-semibold text-neutral-900">
          Profile information
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Update the personal details linked to your workspace authorization token.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800 border border-emerald-200/80 animate-in fade-in duration-200">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-error-50 px-3.5 py-2.5 text-xs font-medium text-error-800 border border-error-200/80 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-error-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        {/* Avatar Section */}
        <AvatarSection
          currentAvatarUrl={avatarUrl}
          onAvatarChange={(newUrl) => {
            setAvatarUrl(newUrl);
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          disabled={isSubmitting}
        />

        {/* Full Name Field */}
        <div className="space-y-1.5 max-w-lg">
          <Input
            id="full-name"
            label="Full name"
            isRequired
            type="text"
            placeholder="e.g. Đạt Phan"
            error={errors.fullName?.message}
            disabled={isSubmitting}
            {...register("fullName")}
          />
        </div>

        {/* Email Address Field (Read-only / Verified) */}
        <div className="space-y-1.5 max-w-lg">
          <div className="flex items-center justify-between">
            <label
              htmlFor="email-address"
              className="block text-xs font-medium text-neutral-700 select-none"
            >
              Email address
            </label>
            <Badge
              variant="primary"
              size="sm"
              className="gap-1 bg-primary-50 text-primary-700 border-primary-200/80 font-medium text-[11px]"
            >
              <CheckCircle2 className="h-3 w-3 text-primary-600" />
              <span>Verified</span>
            </Badge>
          </div>

          <input
            id="email-address"
            type="email"
            value={user?.email || ""}
            disabled
            readOnly
            className="w-full rounded-md border border-neutral-200 bg-neutral-100/70 px-3.5 py-2.5 text-sm text-neutral-600 cursor-not-allowed select-all"
          />

          <div className="flex items-start gap-1.5 pt-1 text-xs text-neutral-500">
            <Info className="h-3.5 w-3.5 shrink-0 text-neutral-400 mt-0.5" />
            <span>
              Email address cannot be changed directly. Contact your workspace administrator to update your email.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting || !canSave}
            className="h-9 px-4 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting || !canSave}
            className="h-9 px-4 text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-xs"
          >
            {isSubmitting ? "Saving changes..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};
