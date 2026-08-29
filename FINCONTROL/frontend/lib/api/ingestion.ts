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

  const res = await fetch("http://localhost:8000/api/v1/ingestion/csv-statement", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "CSV upload failed" }));
    throw new Error(err.detail || "CSV upload failed");
  }

  return res.json();
}

export async function ingestJSONRows(rows: any[]): Promise<CSVIngestionResponse> {
  return apiClient.post<CSVIngestionResponse>("/ingestion/json", { rows });
}
