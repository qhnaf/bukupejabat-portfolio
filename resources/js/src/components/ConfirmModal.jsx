import React from "react";
import Modal from "./Modal";
import Button from "./ui/Button";

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    message = "Are you sure?",
}) {
    if (!open) return null;

    return (
        <Modal className="text-slate-700" open={open} onClose={onClose} title="Konfirmasi">
            <p className="mb-4 text-sm text-slate-700">{message}</p>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                    Batal
                </Button>
                <Button type="button" variant="danger" size="sm" onClick={() => { onConfirm && onConfirm(); onClose && onClose(); }}>
                    Hapus
                </Button>
            </div>
        </Modal>
    );
}
