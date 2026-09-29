import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Login() {
  const [form, setForm] = useState({ correo: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogin = () => {
    setError('')
    setCargando(true)

    api.post('/auth/login', form)
      .then(res => {
        login(res.data)
        navigate('/eventos')
      })
      .catch(err => {
        if (err.response) {

          setError('Correo o contraseña incorrectos')
        } else {

          setError('Error al conectar con el servidor')
        }
      })
      .finally(() => setCargando(false))
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Sistema de Gestión de Eventos</h1>
        <h2>Iniciar Sesión</h2>
        {error && <p className="login-error">{error}</p>}
        <input
          name="correo"
          placeholder="Correo"
          value={form.correo}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
        />
        <button className="btn-login" onClick={handleLogin} disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}

export default Login