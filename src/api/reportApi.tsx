import api from "./axiosInstance";

export interface CreateReportRequest {
  reportedUserId?: number;
  postId?: number;
  reason: string;
  details?: string;
}

export interface ReportResponse {
  id: number;
  reporterId: number;
  reporterName: string;
  reportedUserId?: number;
  reportedUserName?: string;
  postId?: number;
  reason: string;
  details?: string;
  status: "pending" | "reviewed" | "dismissed";
  createdAt: string;
  reviewedAt?: string;
  reviewerId?: number;
  reviewerName?: string;
}

export const createReport = (data: CreateReportRequest) =>
  api.post<ReportResponse>("/reports", data);

export const getReports = () =>
  api.get<ReportResponse[]>("/reports");

export const updateReportStatus = (id: number, status: ReportResponse["status"]) =>
  api.put<ReportResponse>(`/reports/${id}/status`, { status });
