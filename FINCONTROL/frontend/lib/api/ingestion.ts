import { apiClient } from "./client";
import { CSVIngestionResponse } from "./types";

export async function uploadCSVStatement(file: File): Promise<CSVIngestionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("fincontrol_token") : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const isBrowser = typeof window !== "undefined";
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    (isBrowser && window.location.port === "3000"
      ? "http://localhost:8000/api/v1"
      : "/api/v1");

  const res = await fetch(`${apiBase}/ingestion/csv-statement`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "CSV upload failed" }));
    throw new Error(err.detail || `CSV upload failed (HTTP ${res.status})`);
  }

  return res.json();
}

export async function ingestJSONRows(rows: any[]): Promise<CSVIngestionResponse> {
  return apiClient.post<CSVIngestionResponse>("/ingestion/json", { rows });
}
