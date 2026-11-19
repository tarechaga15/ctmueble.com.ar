import { useState, useEffect } from "react";
import Modal from "../Modal";
import Data from "../Data";
import ErrorAlert from "../ErrorAlert";
import { useToast } from "../../context/ToastContext";
import { Button } from "@/components/ui/button";

export default function CancelEssayModal({ show, onClose, onCancelEssay, loading }) {
  const { error: showErrorToast } = useToast();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) {
      setReason("");
      setError("");
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Indicá el motivo de la cancelación.");
      return;
    }
    try {
      await onCancelEssay(trimmed);
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error al cancelar el ensayo";
      setError(message);
      showErrorToast(message);
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Cancelar ensayo"
      onSubmit={handleSubmit}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Volver
          </Button>
          <Button type="submit" variant="destructive" disabled={loading}>
            {loading ? "Cancelando..." : "Cancelar ensayo"}
          </Button>
        </>
      }
    >
      <div className="w-full space-y-4">
        <p className="text-sm text-muted-foreground">
          Esta acción marcará el ensayo como <strong className="text-foreground">cancelado</strong>. Indicá brevemente el motivo.
        </p>
        <div>
          <Data
            label="Motivo de cancelación"
            value={reason}
            forceInput
            inputType="textarea"
            placeholder="Ej.: El cliente desistió del ensayo, error en la solicitud, etc."
            realTimeChange
            onSave={(val) => setReason(val ?? "")}
          />
        </div>
        {error && <ErrorAlert message={error} />}
      </div>
    </Modal>
  );
}
