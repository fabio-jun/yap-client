interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, description, confirmLabel = "Delete", onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <dialog className="modal modal-open" onClick={onCancel}>
      <div className="modal-box max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg">{title}</h3>
        {description && <p className="text-base-content/50 text-sm mt-2">{description}</p>}
        <div className="modal-action">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-error btn-sm" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
