import { useId } from 'react';

function EventFlowLogo({ size = 38 }) {
    const uid = useId();
    const topRoofId = `efTopRoof-${uid}`;
    const topFrontId = `efTopFront-${uid}`;
    const midRoofId = `efMidRoof-${uid}`;
    const midFrontId = `efMidFront-${uid}`;
    const botRoofId = `efBotRoof-${uid}`;
    const botFrontId = `efBotFront-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0, display: 'block' }}
        >
            <defs>
                <linearGradient id={topRoofId} x1="24" y1="36" x2="76" y2="20" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="50%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#67e8f9" />
                </linearGradient>

                <linearGradient id={topFrontId} x1="42" y1="48" x2="76" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0052cc" />
                    <stop offset="55%" stopColor="#1d4ed8" />
                    <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>

                <linearGradient id={midRoofId} x1="42" y1="56" x2="95" y2="29" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>

                <linearGradient id={midFrontId} x1="42" y1="68" x2="95" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3730a3" />
                    <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>

                <linearGradient id={botRoofId} x1="51" y1="78" x2="96" y2="62" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0f2557" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>

                <linearGradient id={botFrontId} x1="61" y1="92" x2="96" y2="72" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#050c1f" />
                    <stop offset="100%" stopColor="#0f2347" />
                </linearGradient>
            </defs>

            {/* --- BARRA MEDIA (ÍNDIGO / MORADO) --- */}
            <path
                d="M42 54 L88 28 C92 26 95 28 95 32 L42 62 Z"
                fill={`url(#${midRoofId})`}
            />
            <path
                d="M42 62 L95 32 L95 41 C95 44 93 47 90 49 L42 76 Z"
                fill={`url(#${midFrontId})`}
            />

            {/* --- BLOQUE SUPERIOR (CELESTE / AZUL ELÉCTRICO) --- */}
            <path
                d="M25 33 L58 14 C62 12 66 13 69 15 L76 19 L42 39 L24 34 C24 33.5 24.4 33.2 25 33 Z"
                fill={`url(#${topRoofId})`}
            />
            <path
                d="M42 39 L76 19 L76 32 C76 35 74 38 71 40 L42 56 Z"
                fill={`url(#${topFrontId})`}
            />
            <path
                d="M24 34 L42 39 L42 56 L24 46 Z"
                fill="#071942"
            />

            {/* --- CINTA AZUL Y ESCALÓN PROYECTADO --- */}
            <path
                d="M24 46 L42 56 L42 68 L24 58 Z"
                fill="#2563eb"
            />
            <path
                d="M42 56 L58 65 L50 70 L34 61 Z"
                fill="#60a5fa"
            />
            <path
                d="M34 61 L50 70 L50 81 L34 72 Z"
                fill="#3b82f6"
            />
            <path
                d="M50 70 L58 65 L58 76 L50 81 Z"
                fill="#1d4ed8"
            />
            <path
                d="M24 58 L34 64 L34 72 L47 79.5 L47 94 L24 81 Z"
                fill="#051029"
            />

            {/* --- BLOQUE INFERIOR (GANCHO AZUL MARINO OSCURO) --- */}
            <path
                d="M51 76 L61 82 L61 104 L51 98 Z"
                fill="#040a1a"
            />
            <path
                d="M51 76 L61 70 C64 68 68 70 68 74 L68 78 L90 65 C93 63 96 65 96 69 L61 89 L51 83 Z"
                fill={`url(#${botRoofId})`}
            />
            <path
                d="M61 89 L96 69 L96 78 C96 82 93 86 89 89 L65 103 C62 105 61 104 61 101 Z"
                fill={`url(#${botFrontId})`}
            />
        </svg>
    );
}

export default EventFlowLogo;