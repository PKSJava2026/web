import { useEffect, useId, useRef, type ReactNode } from "react";
import "./Modal.css";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number | string;
}

export const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = 480 }: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="modal-overlay"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {isOpen && (
        <div className="modal-container" style={{ maxWidth }}>
          <div className="modal-header">
            <h3 className="modal-title" id={titleId}>
              {title}
            </h3>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      )}
    </dialog>
  );
};
