import { useState, useEffect } from 'react'
import api from '../services/api'

function Eventos() {
  const [eventos, setEventos] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/eventos')
      .then(res => setEventos(res.data))
      .catch(err => {
        console.error(err)
        setError('No se pudieron cargar los eventos')
      })
  }, [])

  return (
    <div className="pagina">
      <h2>Lista de Eventos</h2>
      {error && <p className="login-error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Fecha</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map(evento => (
            <tr key={evento.id}>
              <td>{evento.id}</td>
              <td>{evento.nombre}</td>
              <td>{evento.fecha}</td>
              <td>{evento.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Eventos