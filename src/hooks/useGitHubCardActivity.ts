import * as React from "react";
import { githubApi } from "@/apis/github.api";

export function useGitHubCardActivity() {
  const fetchGitActivity = React.useCallback(
    (cardId: string, cardCode: string) => githubApi.getCardGitActivity(cardId, cardCode),
    []
  );
  return { fetchGitActivity };
}
