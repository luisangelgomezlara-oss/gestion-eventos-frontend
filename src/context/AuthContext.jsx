import { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    // Cambiamos localStorage por sessionStorage para que la sesión muera al cerrar la pestaña
    const correo = sessionStorage.getItem('correo')
    const rol = sessionStorage.getItem('rol')
    const token = sessionStorage.getItem('token')
    return token ? { correo, rol, token } : null
  })

  const login = (data) => {
    // Guardamos en sessionStorage de forma temporal y segura por sesión de pestaña
    sessionStorage.setItem('token', data.token)
    sessionStorage.setItem('correo', data.correo)
    sessionStorage.setItem('rol', data.rol)
    setUsuario(data)
  }

  const logout = () => {
    // Limpiamos todo al cerrar sesión
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('correo')
    sessionStorage.removeItem('rol')
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