import api from './api';

export const crearLocalidad = async (localidad) => {
    const response = await api.post('/api/localidades', localidad);
    return response.data;
};

export const obtenerLocalidadesPorEvento = async (eventoId) => {
    const response = await api.get(`/api/localidades/evento/${eventoId}`);
    return response.data;
};

export const eliminarLocalidad = async (id) => {
    const response = await api.delete(`/api/localidades/${id}`);
    return response.data;
};