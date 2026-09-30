import * as React from "react";

import type { UseCountdownReturn } from "@/types";

/**
 * Reusable countdown timer hook (for OTP, email resends, rate limiting).
 */
export function useCountdown(initialSeconds: number = 0): UseCountdownReturn {
  const [secondsLeft, setSecondsLeft] = React.useState(initialSeconds);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const start = React.useCallback((seconds: number) => {
    setSecondsLeft(seconds);
  }, []);

  const reset = React.useCallback(() => {
    setSecondsLeft(0);
  }, []);

  return {
    secondsLeft,
    isActive: secondsLeft > 0,
    start,
    reset,
  };
}
