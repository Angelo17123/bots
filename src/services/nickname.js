/**
 * 📛 SERVICIO DE NICKNAME
 * ============================================================
 * Generación de nicknames por rol.
 * Baja complejidad ciclomática y sin duplicación.
 */

const { ROLE_PREFIXES, ROLE_IDS } = require('../config/roles');

/**
 * Generar nickname según el rol del usuario
 * @param {string} rolId - ID del rol
 * @param {string} nombreIC - Nombre IC del usuario
 * @param {string} idIC - ID del personaje
 * @returns {string} Nickname formateado
 */
function generarNickname(rolId, nombreIC, idIC) {
    // Alta Cupula tiene formato especial
    if (rolId === ROLE_IDS.ALTA_CUPULA) {
        return `🔥 ${nombreIC} #BuenaGente`;
    }
    
    const prefijo = ROLE_PREFIXES[rolId] || 'EvT 🎪';
    return `${prefijo} ${nombreIC} | ${idIC}`;
}

/**
 * Obtener prefijo de un rol
 * @param {string} rolId - ID del rol
 * @returns {string} Prefijo del rol
 */
function obtenerPrefijo(rolId) {
    return ROLE_PREFIXES[rolId] || 'EvT 🎪';
}

/**
 * Obtener el nombre de un rol por su ID
 * @param {string} rolId - ID del rol
 * @returns {string} Nombre del rol
 */
function obtenerNombreRol(rolId) {
    const nombres = Object.entries(require('../config/AVAILABLE_ROLES')).find(([id]) => id === rolId);
    return nombres ? nombres[1] : null;
}

module.exports = {
    generarNickname,
    obtenerPrefijo,
    obtenerNombreRol
};