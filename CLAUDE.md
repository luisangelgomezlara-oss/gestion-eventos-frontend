# Directivas de Desarrollo para Claude Code (Modo Autónomo Local - Ollama)

## 1. Contexto del Proyecto
- **Arquitectura:** Full Stack monolítica separada (Backend: Spring Boot 3 + Spring Security + JPA/Hibernate + MySQL; Frontend: React + Vite + Axios).
- **Dominio de Negocio:** Sistema de Gestión de Eventos, Cartelera pública, selección interactiva de silletería por localidades, compra transaccional atómica de tickets y panel de liquidaciones financieras (cálculo de porcentajes de recaudación).
- **Roles de Seguridad:** `ADMIN` (gestión total y liquidaciones) y `USER` (vitrina pública, cartelera y compra de asientos).

## 2. Reglas de Comportamiento y Autonomía
- **Cero Pausas Innecesarias:** Ejecuta cambios de código completos, refactorizaciones y correcciones lógicas de manera directa. No pidas autorizaciones para decisiones técnicas menores, nombres de variables locales, imports, manejo de excepciones estándar o estructuración de DTOs.
- **Autorizaciones Requeridas Únicamente Para:** 
  1. Modificaciones estructurales masivas en la base de datos (migraciones de tablas principales o cambios drásticos en entidades relacionales).
  2. Borrado masivo de componentes o servicios ya funcionales.
- **Optimización de Tokens:** Sé extremadamente conciso en tus respuestas conversacionales. Ve directo al grano con los bloques de código modificados. Evita explicaciones teóricas largas a menos que se te solicite explícitamente.

## 3. Estándares Técnicos Obligatorios
- **Backend (Spring Boot):**
  - Mantén el uso de anotaciones Lombok (`@Data`, `@RequiredArgsConstructor`) para reducir boilerplate.
  - Las transacciones críticas de compra deben usar `@Transactional` en las capas de servicio para garantizar consistencia atómica en los asientos (`EstadoAsiento.VENDIDO`).
  - Respeta las rutas base de los controladores (`/api/...`) y asegúrate de no romper las reglas de CORS ni los filtros JWT existentes en `SecurityConfig`.
- **Frontend (React):**
  - Utiliza componentes funcionales limpios con Hooks (`useState`, `useEffect`).
  - Mantén la inyección dinámica de tokens en las peticiones mediante Axios (`getAuthHeaders()`).
  - Preserva la paleta de colores corporativa y el diseño oscuro minimalista ya implementado en las vistas (`Cartelera.jsx`, `GestionSillas.jsx`).