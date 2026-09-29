import { useState, useEffect } from 'react'
import api from '../services/api'

function Lugares() {
  const [lugares, setLugares] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/lugares')
      .then(res => setLugares(res.data))
      .catch(err => {
        console.error(err)
        setError('No se pudieron cargar los lugares')
      })
  }, [])

  return (
    <div className="pagina">
      <h2>Lista de Lugares</h2>
      {error && <p className="login-error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>Capacidad</th>
          </tr>
        </thead>
        <tbody>
          {lugares.map(lugar => (
            <tr key={lugar.id}>
              <td>{lugar.id}</td>
              <td>{lugar.nombre}</td>
              <td>{lugar.direccion}</td>
              <td>{lugar.ciudad}</td>
              <td>{lugar.capacidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Lugares