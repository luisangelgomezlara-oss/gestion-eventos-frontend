import { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const correo = localStorage.getItem('correo')
    const rol = localStorage.getItem('rol')
    const token = localStorage.getItem('token')
    return token ? { correo, rol, token } : null
  })

  const login = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('correo', data.correo)
    localStorage.setItem('rol', data.rol)
    setUsuario(data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('correo')
    localStorage.removeItem('rol')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}