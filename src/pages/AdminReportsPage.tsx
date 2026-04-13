import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ExternalLink, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { getReports, updateReportStatus, type ReportResponse } from "../api/reportApi";
import { useAuth } from "../hooks/useAuth";

const statusLabels: Record<ReportResponse["status"], string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  dismissed: "Dismissed",
};

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role !== "Admin") return;
    getReports()
      .then((res) => setReports(res.data))
      .finally(() => setLoading(false));
  }, [user?.role]);

  if (!user || user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  const handleStatusChange = async (id: number, status: ReportResponse["status"]) => {
    setUpdatingId(id);
    try {
      const res = await updateReportStatus(id, status);
      setReports((prev) => prev.map((report) => (report.id === id ? res.data : report)));
      toast.success("Report updated.");
    } catch {
      toast.error("Could not update report.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-6 h-6 text-error" />
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-base-200 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-base-300 rounded w-1/2 mb-3" />
              <div className="h-3 bg-base-300 rounded w-full mb-2" />
              <div className="h-3 bg-base-300 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <p className="text-center text-base-content/50 py-12">No reports.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <article key={report.id} className="bg-base-200 rounded-lg p-4 border border-base-300/70">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-outline">{statusLabels[report.status]}</span>
                    <span className="font-semibold capitalize">{report.reason}</span>
                  </div>
                  <p className="text-xs text-base-content/50 mt-1">
                    Reported by @{report.reporterName} on {formatDate(report.createdAt)}
                  </p>
                </div>

                <select
                  className="select select-bordered select-sm w-32 shrink-0"
                  value={report.status}
                  disabled={updatingId === report.id}
                  onChange={(e) => handleStatusChange(report.id, e.target.value as ReportResponse["status"])}
                  aria-label="Report status"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-sm">
                {report.reportedUserId && (
                  <Link to={`/profile/${report.reportedUserId}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                    @{report.reportedUserName || `user-${report.reportedUserId}`}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
                {report.postId && (
                  <div>
                    <Link to={`/post/${report.postId}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                      View reported yap
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
                {report.details && (
                  <p className="text-base-content/70 leading-relaxed whitespace-pre-wrap">{report.details}</p>
                )}
                {report.reviewerName && (
                  <p className="text-xs text-base-content/50">
                    Reviewed by @{report.reviewerName}
                    {report.reviewedAt ? ` on ${formatDate(report.reviewedAt)}` : ""}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
