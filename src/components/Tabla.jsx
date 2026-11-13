function Tabla({ columnas, datos, onEditar, onEliminar, onLiquidar, cargando }) {
  const hayAcciones = onEditar || onEliminar || onLiquidar

  if (cargando) {
    return <p className="tabla-estado">Cargando...</p>
  }

  return (
    <table>
      <thead>
        <tr>
          {columnas.map(col => (
            <th key={col.titulo}>{col.titulo}</th>
          ))}
          {hayAcciones && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {datos.length === 0 ? (
          <tr>
            <td colSpan={columnas.length + (hayAcciones ? 1 : 0)} className="tabla-vacia">
              No hay registros para mostrar
            </td>
          </tr>
        ) : (
          datos.map(fila => (
            <tr key={fila.id}>
              {columnas.map(col => (
                <td key={col.titulo} className={col.nowrap ? 'celda-nowrap' : undefined}>
                  {col.render ? col.render(fila) : fila[col.campo]}
                </td>
              ))}
              {hayAcciones && (
                <td>
                  <div className="acciones-celda" style={{ display: 'flex', gap: '5px' }}>
                    {onEditar && (
                      <button className="btn-editar" onClick={() => onEditar(fila)}>Editar</button>
                    )}
                    {onEliminar && (
                      <button className="btn-eliminar" onClick={() => onEliminar(fila)}>Eliminar</button>
                    )}
                    {/* Nuevo botón exclusivo para el recaudo */}
                    {onLiquidar && (
                      <button 
                        style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} 
                        onClick={() => onLiquidar(fila)}
                      >
                        Recaudo
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

export default Tabla