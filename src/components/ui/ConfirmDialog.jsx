import Modal from './Modal'
import Button from './Button'

// Confirmation modal (delete article/category/ad...) reused instead of
// every admin screen building its own Modal + buttons from scratch.
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  loading = false,
}) {
  // While the action is in progress, ignores closing via backdrop/Esc/X —
  // avoids closing the modal and triggering a second deletion on top of the first.
  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} title={title}>
      <p className="text-sm text-ink-600">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading} disabled={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
