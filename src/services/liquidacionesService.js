import api from './api';

export const generarLiquidacion = async (eventoId) => {
    const response = await api.post(`/api/liquidaciones/evento/${eventoId}`);
    return response.data;
};