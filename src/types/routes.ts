import { ROUTES } from "@/constants/routes";

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
