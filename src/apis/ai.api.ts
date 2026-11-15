import axios, { type AxiosInstance } from "axios";
import type { ChatAgentRequest, ChatAgentResponse } from "@/types";

const AI_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || "/ai-service";
const AI_SERVICE_KEY = import.meta.env.VITE_AI_SERVICE_KEY;

export const aiClient: AxiosInstance = axios.create({
  baseURL: AI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(AI_SERVICE_KEY ? { Authorization: `Bearer ${AI_SERVICE_KEY}` } : {}),
  },
  timeout: 30000,
});

export const aiApi = {
  chat: async (payload: ChatAgentRequest): Promise<ChatAgentResponse> => {
    const response = await aiClient.post<ChatAgentResponse>("/v1/agent/chat", payload);
    return response.data;
  },
};
