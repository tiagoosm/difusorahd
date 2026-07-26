import { forwardRef } from 'react'
import Select from '../ui/Select'
import { AD_POSITIONS } from '../../utils/adPositions'

const AdPositionSelector = forwardRef(function AdPositionSelector({ label = 'Posição', ...props }, ref) {
  return (
    <Select ref={ref} label={label} {...props}>
      <option value="">Selecione...</option>
      {AD_POSITIONS.map((position) => (
        <option key={position.value} value={position.value}>
          {position.label}
        </option>
      ))}
    </Select>
  )
})

export default AdPositionSelector
