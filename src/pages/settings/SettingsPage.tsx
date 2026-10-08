import * as React from "react";
import { User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { profileApi } from "@/apis/profile.api";
import {
  ProfileInformationCard,
  ChangePasswordCard,
} from "@/components/profile";
import type { SettingsTab } from "@/types";

export const SettingsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile");
  const [isLoading, setIsLoading] = React.useState<boolean>(!user);

  React.useEffect(() => {
    let isMounted = true;
    const fetchLatestProfile = async () => {
      try {
        const profile = await profileApi.getProfile();
        if (isMounted) {
          setUser(profile);
        }
      } catch {
        // If offline or network issue, fallback to cached state in useAuthStore
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLatestProfile();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your personal identity credentials, profile details, and account security perimeter.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors select-none",
            activeTab === "profile"
              ? "border-primary-600 text-primary-600 font-semibold"
              : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
          )}
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors select-none",
            activeTab === "security"
              ? "border-primary-600 text-primary-600 font-semibold"
              : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
          )}
        >
          <Shield className="h-4 w-4" />
          <span>Security</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {isLoading ? (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs animate-pulse space-y-6">
          <div className="h-5 w-40 bg-neutral-200 rounded" />
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-neutral-200" />
            <div className="space-y-2">
              <div className="h-8 w-28 rounded-lg bg-neutral-200" />
              <div className="h-3 w-48 rounded bg-neutral-200" />
            </div>
          </div>
          <div className="space-y-4 max-w-lg pt-4">
            <div className="h-10 w-full rounded-md bg-neutral-200" />
            <div className="h-10 w-full rounded-md bg-neutral-200" />
          </div>
        </div>
      ) : activeTab === "profile" ? (
        <ProfileInformationCard
          user={user}
          onUpdateSuccess={(updatedUser) => setUser(updatedUser)}
        />
      ) : (
        <ChangePasswordCard />
      )}
    </div>
  );
};
