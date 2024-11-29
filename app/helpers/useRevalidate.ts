import { useNavigate } from "@remix-run/react";
import { useCallback, useEffect } from "react";

interface Options {
  enabled?: boolean;
  interval?: number;
}

export default function useRevalidate() {
  // We get the navigate function from React Rotuer
  const navigate = useNavigate();
  // And return a function which will navigate to `.` (same URL) and replace it
  return useCallback(function revalidate() {
    navigate('.', { replace: true });
  }, [navigate]);
}

export function useRevalidateOnInterval({ enabled = false, interval = 2_500 }: Options) {
  const revalidate = useRevalidate();
  useEffect(function revalidateOnInterval() {
    if (!enabled) return;
    const intervalId = setInterval(revalidate, interval);
    return () => clearInterval(intervalId);
  }, [enabled, interval, revalidate]);
}
