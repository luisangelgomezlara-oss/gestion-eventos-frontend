import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventosService from '../services/eventosService';

const Recaudo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [cargando, setCargando] = useState(true);
    
    // Variables del simulador financiero
    const [ingresosTotales, setIngresosTotales] = useState(15000000); // 15 millones por defecto
    const [porcentajeLugar, setPorcentajeLugar] = useState(15); // 15% por defecto

    useEffect(() => {
        cargarEvento();
    }, [id]);

    const cargarEvento = async () => {
        try {
            const data = await eventosService.obtener(id);
            setEvento(data);
        } catch (error) {
            console.error("Error al cargar el evento:", error);
            alert("No se pudo cargar la información del evento.");
            navigate('/eventos');
        } finally {
            setCargando(false);
        }
    };

    if (cargando) return <div style={{ color: '#a0a0a0', padding: '40px', textAlign: 'center', backgroundColor: '#090a0f', minHeight: '100vh' }}>Cargando panel financiero...</div>;
    if (!evento) return <div style={{ color: '#ff4444', padding: '40px', textAlign: 'center', backgroundColor: '#090a0f', minHeight: '100vh' }}>Evento no encontrado.</div>;

    // Cálculos matemáticos en tiempo real
    const comisionLugar = ingresosTotales * (porcentajeLugar / 100);
    const gananciaOrganizador = ingresosTotales - comisionLugar;

    // Formateador de pesos colombianos
    const formatearMoneda = (valor) => new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        minimumFractionDigits: 0 
    }).format(valor);

    return (
        <div style={{ backgroundColor: '#090a0f', color: '#ffffff', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a2d3e', paddingBottom: '15px', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', margin: 0 }}>Liquidación y Recaudo</h1>
                    <button onClick={() => navigate('/eventos')} style={{ ...btnStyle, backgroundColor: '#333' }}>
                        Volver a Eventos
                    </button>
                </div>

                {/* TARJETA DE INFORMACIÓN DEL EVENTO */}
                <div style={{ backgroundColor: '#12141d', borderRadius: '12px', padding: '25px', marginBottom: '30px', borderLeft: '4px solid #00a8ff' }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '22px' }}>{evento.nombre}</h2>
                    <p style={{ margin: 0, color: '#a0a0a0', fontSize: '15px' }}>
                        📅 Fecha: {evento.fecha} | 📍 Escenario: {evento.lugar?.nombre} ({evento.lugar?.ciudad})
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* COLUMNA IZQUIERDA: Controles del Simulador */}
                    <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#12141d', borderRadius: '12px', padding: '25px' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#a0a0a0' }}>⚙️ Simulador de Ventas</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px' }}>
                                    Ingresos Brutos (Taquilla Total)
                                </label>
                                <input 
                                    type="number" 
                                    value={ingresosTotales} 
                                    onChange={(e) => setIngresosTotales(Number(e.target.value))}
                                    style={inputStyle} 
                                    min="0"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px' }}>
                                    Porcentaje Acordado para el Lugar (%)
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="range" 
                                        value={porcentajeLugar} 
                                        onChange={(e) => setPorcentajeLugar(Number(e.target.value))}
                                        min="0" 
                                        max="100" 
                                        style={{ flex: 1 }}
                                    />
                                    <span style={{ fontWeight: 'bold', fontSize: '18px', width: '40px', textAlign: 'right' }}>
                                        {porcentajeLugar}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Dashboard Financiero */}
                    <div style={{ flex: '1.5', minWidth: '350px', backgroundColor: '#12141d', borderRadius: '12px', padding: '25px' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#a0a0a0' }}>📊 Distribución del Recaudo</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {/* Total Generado */}
                            <div style={cardFinanciera}>
                                <span style={{ color: '#a0a0a0' }}>Ingresos Brutos:</span>
                                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatearMoneda(ingresosTotales)}</span>
                            </div>

                            {/* Pago al Lugar */}
                            <div style={{ ...cardFinanciera, borderLeft: '4px solid #f39c12' }}>
                                <div>
                                    <span style={{ color: '#a0a0a0', display: 'block' }}>Aporte para el Escenario ({porcentajeLugar}%):</span>
                                    <span style={{ fontSize: '12px', color: '#f39c12' }}>Destino: {evento.lugar?.nombre}</span>
                                </div>
                                <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#f39c12' }}>
                                    {formatearMoneda(comisionLugar)}
                                </span>
                            </div>

                            {/* Ganancia Organizador */}
                            <div style={{ ...cardFinanciera, borderLeft: '4px solid #4caf50' }}>
                                <div>
                                    <span style={{ color: '#a0a0a0', display: 'block' }}>Ganancia Neta Organizador:</span>
                                </div>
                                <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#4caf50' }}>
                                    {formatearMoneda(gananciaOrganizador)}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Estilos
const inputStyle = { width: '100%', padding: '12px', backgroundColor: '#090a0f', border: '1px solid #2a2d3e', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '16px', boxSizing: 'border-box' };
const btnStyle = { padding: '10px 20px', borderRadius: '8px', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' };
const cardFinanciera = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1c29', padding: '20px', borderRadius: '8px' };

export default Recaudo;