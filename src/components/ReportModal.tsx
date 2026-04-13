import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { createReport } from "../api/reportApi";

const reasons = [
  { value: "spam", label: "Spam or scams" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate", label: "Hate or abuse" },
  { value: "violence", label: "Violence or threats" },
  { value: "sexual", label: "Sexual content" },
  { value: "other", label: "Something else" },
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  reportedUserId?: number;
  postId?: number;
}

export default function ReportModal({ open, onClose, reportedUserId, postId }: ReportModalProps) {
  const [reason, setReason] = useState(reasons[0].value);
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createReport({
        reportedUserId,
        postId,
        reason,
        details: details.trim() || undefined,
      });
      toast.success("Report sent.");
      setReason(reasons[0].value);
      setDetails("");
      onClose();
    } catch {
      toast.error("Could not send report.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog className="modal modal-open" onClick={onClose}>
      <div className="modal-box max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Report</h3>
          <button type="button" className="btn btn-sm btn-circle btn-ghost cursor-pointer" onClick={onClose} aria-label="Close report form">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-base-content/70" htmlFor="report-reason">
              Reason
            </label>
            <select
              id="report-reason"
              className="select select-bordered w-full mt-1"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {reasons.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-base-content/70" htmlFor="report-details">
              Details
            </label>
            <textarea
              id="report-details"
              className="textarea textarea-bordered w-full mt-1"
              rows={4}
              maxLength={500}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add context for the moderators"
            />
            <span className="text-xs text-base-content/40">{details.length}/500</span>
          </div>
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm cursor-pointer" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-error btn-sm cursor-pointer" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-xs" /> : "Send report"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
