import api from './api';

export const obtenerAsientosPorLocalidad = async (localidadId) => {
    const response = await api.get(`/api/asientos/localidad/${localidadId}`);
    return response.data;
};

export const actualizarEstadoAsiento = async (id, estado) => {
    const response = await api.patch(`/api/asientos/${id}/estado?estado=${estado}`);
    return response.data;
};