import axios from 'axios';

const API_URL = 'http://localhost:8080/api-eventos/api/inscripciones';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); 
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const comprarTickets = async (datosCompra) => {
    const response = await axios.post(`${API_URL}/comprar`, datosCompra, getAuthHeaders());
    return response.data;
};

const listar = async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
};

export default { comprarTickets, listar };