import { useState } from 'react'

// Drag-to-reorder (native HTML5 drag and drop) for a list of items with an
// `id`. Reusable across any draggable list in the admin.
export function useDragReorder(items, setItems) {
  const [draggedId, setDraggedId] = useState(null)

  function handleDragStart(id) {
    return (event) => {
      setDraggedId(id)
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  function handleDragOver(id) {
    return (event) => {
      event.preventDefault()
      if (id === draggedId) return

      const draggedIndex = items.findIndex((item) => item.id === draggedId)
      const targetIndex = items.findIndex((item) => item.id === id)
      if (draggedIndex === -1 || targetIndex === -1) return

      const next = [...items]
      const [draggedItem] = next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, draggedItem)
      setItems(next)
    }
  }

  function handleDragEnd() {
    setDraggedId(null)
  }

  return { draggedId, handleDragStart, handleDragOver, handleDragEnd }
}
