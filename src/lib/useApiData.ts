import { useEffect, useState } from "react";

export function apiError(error: unknown) {
  const failure = error as { data?: { message?: string }; message?: string } | null;
  return failure?.data?.message || failure?.message || "Не удалось выполнить запрос";
}

export function useApiData<T>(load: () => Promise<T>) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{
    load: () => Promise<T>;
    version: number;
    data?: T;
    error?: string;
  }>();

  useEffect(() => {
    let active = true;
    load().then(
      (data) => {
        if (active) setResult({ load, version, data });
      },
      (error) => {
        if (active) setResult({ load, version, error: apiError(error) });
      },
    );
    return () => {
      active = false;
    };
  }, [load, version]);

  const current = result?.load === load && result.version === version ? result : undefined;
  return {
    data: current?.data,
    error: current?.error,
    loading: !current,
    refresh: () => setVersion((value) => value + 1),
  };
}
