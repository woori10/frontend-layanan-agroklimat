"use client";

import React, { ComponentType, useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

const API_BASE_URL = "http://localhost:3000";

export interface CardDashboardProps {
  /**
   * Title / description shown in the card (e.g. "Total Permohonan")
   */
  title: string;

  /**
   * LucideIcon component or any React Node / Component to render as the icon
   */
  icon: LucideIcon | ComponentType<{ className?: string }> | React.ReactNode;

  /**
   * Tailwind classes for the icon background (e.g. "bg-[#385A3F]")
   */
  iconBgClass?: string;

  /**
   * Tailwind classes for the icon itself (e.g. "text-[#86EFAC]")
   */
  iconColorClass?: string;

  /**
   * Static value to be shown immediately. Bypasses backend fetch if set.
   */
  value?: string | number;

  /**
   * API endpoint to hit (e.g., "/tiket/admin" or "/tiket").
   * Automatically adds Authorization Bearer token from localStorage.
   */
  apiEndpoint?: string;

  /**
   * Custom async fetch function. Will be used if value is not set.
   */
  fetchFn?: () => Promise<any>;

  /**
   * Data parsing callback to transform backend API response to a number or string.
   * Example: (data) => data.length
   */
  processData?: (data: any) => string | number;

  /**
   * Optional footer note, description, or unit.
   */
  desc?: string;

  /**
   * Custom CSS classes for the card wrapper.
   */
  className?: string;
}

export default function CardDashboard({
  title,
  icon: Icon,
  iconBgClass = "bg-[#385A3F]", // Premium dark-green color from the user's reference image
  iconColorClass = "text-[#86EFAC]", // Light green icon color
  value: staticValue,
  apiEndpoint,
  fetchFn,
  processData,
  desc,
  className = "",
}: CardDashboardProps) {
  const [dataValue, setDataValue] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processDataRef = React.useRef(processData);
  const fetchFnRef = React.useRef(fetchFn);

  useEffect(() => {
    processDataRef.current = processData;
    fetchFnRef.current = fetchFn;
  }, [processData, fetchFn]);

  useEffect(() => {
    // Use static value if provided
    if (staticValue !== undefined) {
      setDataValue(staticValue);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let resultData: any;

        if (fetchFnRef.current) {
          resultData = await fetchFnRef.current();
        } else if (apiEndpoint) {
          const token = localStorage.getItem("agro_token");
          const url = apiEndpoint.startsWith("http")
            ? apiEndpoint
            : `${API_BASE_URL}${apiEndpoint.startsWith("/") ? apiEndpoint : `/${apiEndpoint}`}`;

          const res = await fetch(url, {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          });

          if (!res.ok) {
            if (res.status === 401) {
              const token = localStorage.getItem("agro_token");
              let isStaff = false;
              if (token) {
                try {
                  const payload = JSON.parse(atob(token.split(".")[1]));
                  if (payload.role && payload.role !== "publik") {
                    isStaff = true;
                  }
                } catch { }
              }
              localStorage.removeItem("agro_token");
              localStorage.removeItem("agro_user_email");
              localStorage.removeItem("agro_user_nip");
              window.location.href = isStaff ? "/login/pegawai" : "/login";
              return;
            }
            throw new Error(`Gagal mengambil data (${res.status})`);
          }

          resultData = await res.json();
        } else {
          return;
        }

        // Apply custom mapping/processing if provided
        const processed = processDataRef.current ? processDataRef.current(resultData) : resultData;
        setDataValue(processed);
      } catch (err: any) {
        console.error(`[CardDashboard Error - ${title}]:`, err);
        setError(err.message || "Gagal memuat");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [staticValue, apiEndpoint, title]);

  // Helper to render icon correctly
  const renderIcon = () => {
    if (!Icon) return null;

    // Check if Icon is a function/component or React Node
    if (typeof Icon === "function" || (typeof Icon === "object" && (Icon as any).$$typeof)) {
      const IconComponent = Icon as ComponentType<{ className?: string }>;
      return <IconComponent className={`h-7 w-7 ${iconColorClass}`} />;
    }

    return <>{Icon}</>;
  };

  return (
    <div
      className={`flex items-center gap-5 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      {/* Icon Container with custom bg */}
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${iconBgClass}`}
      >
        {renderIcon()}
      </div>

      {/* Texts Info */}
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
          {title}
        </span>

        {loading ? (
          <div className="mt-2 h-7 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        ) : error ? (
          <span className="text-xs text-red-500 font-semibold truncate mt-1.5" title={error}>
            {error}
          </span>
        ) : (
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-[var(--foreground)] dark:text-zinc-50 leading-none">
              {dataValue !== null ? dataValue : "0"}
            </span>
            {desc && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-1.5 font-medium">
                {desc}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
