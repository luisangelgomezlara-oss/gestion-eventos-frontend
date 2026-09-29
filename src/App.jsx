import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Eventos from './pages/Eventos'
import Lugares from './pages/Lugares'

function NavBar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="app-header">
      <div className="app-header-top">
        <h1>Sistema de Gestión de Eventos</h1>
        <button onClick={handleLogout} className="btn-logout-corner">
          {usuario?.correo} · {usuario?.rol} · Salir
        </button>
      </div>
      <nav>
        <Link to="/eventos">Eventos</Link>
        <Link to="/lugares">Lugares</Link>
      </nav>
    </header>
  )
}

function RutaProtegida({ children }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" />
  return children
}

function AppContent() {
  const { usuario } = useAuth()

  return (
    <>
      {usuario && <NavBar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/eventos" element={<RutaProtegida><Eventos /></RutaProtegida>} />
        <Route path="/lugares" element={<RutaProtegida><Lugares /></RutaProtegida>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App