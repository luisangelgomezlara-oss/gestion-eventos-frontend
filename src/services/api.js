import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api-eventos',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para inyectar el token desde sessionStorage en rutas protegidas
api.interceptors.request.use(
    (config) => {
        const esRutaPublicaAuth = config.url?.startsWith('/auth/');
        const token = sessionStorage.getItem('token');

        if (token && !esRutaPublicaAuth) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export const loginUsuario = async (credenciales) => {
    const { data } = await api.post('/auth/login', credenciales);
    return data;
};

export const registrarUsuario = async (datosRegistro) => {
    const { data } = await api.post('/auth/register', datosRegistro);
    return data;
};

export default api;