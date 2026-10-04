"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useLoad<T>(fn: () => Promise<T>) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try { setData(await fnRef.current()); setError(null); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload };
}
