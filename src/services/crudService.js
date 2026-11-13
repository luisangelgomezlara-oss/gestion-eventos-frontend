import api from './api'

// Genera las 5 operaciones CRUD para cualquier ruta de la API
export function crearServicio(ruta) {
  return {
    listar: () => api.get(ruta).then(res => res.data),
    obtener: (id) => api.get(`${ruta}/${id}`).then(res => res.data),
    crear: (datos) => api.post(ruta, datos).then(res => res.data),
    actualizar: (id, datos) => api.put(`${ruta}/${id}`, datos).then(res => res.data),
    eliminar: (id) => api.delete(`${ruta}/${id}`)
  }
}