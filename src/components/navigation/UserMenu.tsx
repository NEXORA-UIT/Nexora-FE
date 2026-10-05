import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, User as UserIcon, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import type { UserMenuProps } from "@/types";
import nexoraLogoSrc from "@/assets/logo/logo.png";

export const UserMenu: React.FC<UserMenuProps> = ({
  onLogoutClick,
  className,
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const displayName = user?.fullName || "Phan Gia Đạt";

  const handleProfileClick = () => {
    navigate(ROUTES.SETTINGS);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-lg p-1 hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 data-[state=open]:bg-neutral-100 select-none",
            className
          )}
          aria-label="Account menu"
          title={`Account: ${displayName}`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 font-semibold text-primary-700 text-xs overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="h-7 w-7 rounded-lg object-cover"
              />
            ) : (
              <img
                src={nexoraLogoSrc}
                alt="Avatar"
                className="h-4 w-4 object-contain"
              />
            )}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span className="text-xs font-semibold text-neutral-800 truncate max-w-[120px]">
              {displayName}
            </span>
            <span className="text-[10px] text-neutral-500 font-medium mt-0.5">
              Owner
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-neutral-400 transition-transform duration-200" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-52 p-1.5">
        {/* Compact User Identity */}
        <div className="px-2 py-1.5 border-b border-neutral-100 mb-1">
          <p className="text-xs font-semibold text-neutral-900 truncate">
            {displayName}
          </p>
          {user?.email && (
            <p className="text-[11px] text-neutral-500 truncate mt-0.5">
              {user.email}
            </p>
          )}
        </div>

        {/* Profile Item */}
        <DropdownMenuItem onClick={handleProfileClick}>
          <UserIcon className="h-3.5 w-3.5 text-neutral-500" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout Item */}
        <DropdownMenuItem destructive onClick={onLogoutClick}>
          <LogOut className="h-3.5 w-3.5 text-error-600" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
