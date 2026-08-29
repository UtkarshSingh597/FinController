import { apiClient } from "./client";
import { AlertActionResponse, AlertItem } from "./types";

export async function getAlerts(): Promise<AlertItem[]> {
  return apiClient.get<AlertItem[]>("/alerts");
}

export async function markAlertRead(alertId: string): Promise<AlertActionResponse> {
  return apiClient.patch<AlertActionResponse>(`/alerts/${alertId}/read`, {});
}

export async function resolveAlert(alertId: string): Promise<AlertActionResponse> {
  return apiClient.post<AlertActionResponse>(`/alerts/${alertId}/resolve`, {});
}
