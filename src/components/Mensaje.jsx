import { useEffect } from 'react'

function Mensaje({ tipo, texto, onCerrar }) {
  useEffect(() => {
    if (!texto) return
    const temporizador = setTimeout(onCerrar, 4000)
    return () => clearTimeout(temporizador)
  }, [texto, onCerrar])

  if (!texto) return null

  return (
    <div className={`mensaje mensaje-${tipo}`}>
      <span>{texto}</span>
      <button onClick={onCerrar} className="mensaje-cerrar">×</button>
    </div>
  )
}

export default Mensaje