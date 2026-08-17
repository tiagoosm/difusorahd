import Modal from './Modal'
import Button from './Button'

// Modal de confirmação (excluir notícia/categoria/anúncio...) reaproveitado
// no lugar de cada tela do admin montar o próprio Modal + botões do zero.
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
  // Enquanto a ação está em andamento, ignora fechar pelo backdrop/Esc/X —
  // evita fechar o modal e disparar uma segunda exclusão em cima da primeira.
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
