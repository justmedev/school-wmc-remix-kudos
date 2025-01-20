import { useNavigate, useNavigation } from "@remix-run/react";
import { useCallback, useEffect } from "react";

interface Options {
  enabled?: boolean;
  interval?: number;
}

export default function useRevalidate() {
  // We get the navigate function from React Rotuer
  const navigate = useNavigate();
  const navigation = useNavigation();

  // And return a function which will navigate to `.` (same URL) and replace it
  return useCallback(function revalidate() {
    navigate(navigation.location ?? '.', { replace: true });
  }, [navigate]);
}

export function useRevalidateOnInterval({ enabled = false, interval = 2_500 }: Options) {
  const revalidate = useRevalidate();
  console.log('revalidate. cur navigation:');

  useEffect(function revalidateOnInterval() {
    console.log("useEffect")
    if (!enabled) return;
    const intervalId = setInterval(revalidate, interval);
    return () => clearInterval(intervalId);
  }, [enabled, interval, revalidate]);
}
