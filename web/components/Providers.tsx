"use client";

import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import { apiFetcher, ApiError } from "@/lib/api";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SWRConfig
        value={{
          fetcher: apiFetcher,
          revalidateOnFocus: false,
          onError: (err) => {
            if (err instanceof ApiError && err.status === 401) {
              return;
            }
            console.error(err);
          }
        }}
      >
        {children}
      </SWRConfig>
    </ThemeProvider>
  );
};

export default Providers;
