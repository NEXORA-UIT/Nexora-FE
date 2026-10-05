import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name cannot exceed 120 characters"),
});

export const changePasswordFormSchema = z
  .object({
    oldPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, "New password must be at least 8 characters")
      .max(128, "New password cannot exceed 128 characters")
      .regex(/[A-Z]/, "New password must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "New password must contain at least 1 number"),
    confirmPassword: z
      .string({ required_error: "Please confirm your new password" })
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });
