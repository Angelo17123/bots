/**
 * 📋 CONFIGURACIÓN DE ROLES
 * ============================================================
 * Constantes centralizadas para evitar Magic Strings y duplicación.
 * Cambia aquí y se aplica en todo el sistema.
 */

// IDs de roles desde variables de entorno
const ROLE_IDS = Object.freeze({
    DEV: process.env.DEV_ROLE_ID || '1494806027898585248',
    ALTA_CUPULA: process.env.ALTA_CUPULA_ROLE_ID || '1494805472908152873',
    RESPONSABLE: process.env.RESPONSABLE_ROLE_ID || '1494805401357652000',
    ADM: process.env.ADM_ROLE_ID || '1494805272915480707',
    AUX: process.env.AUX_ROLE_ID || '1494805184180916425',
    LID: process.env.LID_ROLE_ID || '1494805094393188542',
    SUB: process.env.SUB_ROLE_ID || '1494805042685804574',
    MIEMBRO: process.env.MIEMBRO_ROLE_ID || '1494804959588519957',
    TESTER: process.env.TESTER_ROLE_ID || '1494804831758582013'
});

// Roles disponibles para solicitar
const AVAILABLE_ROLES = Object.freeze({
    [ROLE_IDS.ALTA_CUPULA]: 'Alta Cupula',
    [ROLE_IDS.RESPONSABLE]: 'Responsable',
    [ROLE_IDS.ADM]: 'ADM',
    [ROLE_IDS.AUX]: 'Aux',
    [ROLE_IDS.LID]: 'Lid',
    [ROLE_IDS.SUB]: 'Sub',
    [ROLE_IDS.MIEMBRO]: 'Miembro',
    [ROLE_IDS.TESTER]: 'Tester'
});

// Roles que pueden aceptar solicitudes
const ROLES_AUTORIZADOS = Object.freeze({
    [ROLE_IDS.DEV]: 'DEV',
    [ROLE_IDS.ADM]: 'ADM',
    [ROLE_IDS.AUX]: 'Aux',
    [ROLE_IDS.LID]: 'Lid',
    [ROLE_IDS.RESPONSABLE]: 'Responsable',
    [ROLE_IDS.ALTA_CUPULA]: 'Alta Cupula'
});

// Roles con permiso para DM
const ROLES_DM = Object.freeze([
    ROLE_IDS.ADM,
    ROLE_IDS.AUX,
    ROLE_IDS.LID,
    ROLE_IDS.SUB,
    ROLE_IDS.MIEMBRO,
    ROLE_IDS.TESTER
]);

// Prefijos de nickname por rol
const ROLE_PREFIXES = Object.freeze({
    [ROLE_IDS.DEV]: 'DEV 🎪',
    [ROLE_IDS.ALTA_CUPULA]: '🔥',
    [ROLE_IDS.RESPONSABLE]: 'Resp.INT 💀',
    [ROLE_IDS.ADM]: 'ADM.EVT 🎪',
    [ROLE_IDS.AUX]: 'Aux.EVT 🎪',
    [ROLE_IDS.LID]: 'Lid.EVT 🎪',
    [ROLE_IDS.SUB]: 'Sub.EVT 🎪',
    [ROLE_IDS.MIEMBRO]: 'EvT 🎪',
    [ROLE_IDS.TESTER]: 'EvT-T 🎪'
});

// Nombres display de roles
const ROLE_DISPLAY_NAMES = Object.freeze({
    [ROLE_IDS.DEV]: 'DEV',
    [ROLE_IDS.ALTA_CUPULA]: 'Alta Cupula',
    [ROLE_IDS.RESPONSABLE]: 'Responsable',
    [ROLE_IDS.ADM]: 'ADM',
    [ROLE_IDS.AUX]: 'Aux',
    [ROLE_IDS.LID]: 'Lid',
    [ROLE_IDS.SUB]: 'Sub',
    [ROLE_IDS.MIEMBRO]: 'Miembro',
    [ROLE_IDS.TESTER]: 'Tester'
});

// Configuración de canales
const CHANNELS = Object.freeze({
    SOLICITUDES: process.env.CANAL_SOLICITUDES || '1494810053000167645',
    LOGS: process.env.CANAL_LOGS || '1494844109746081882'
});

// IDs de usuarios especiales
const USERS = Object.freeze({
    DEV: process.env.DEV_USER_ID || '1494806027898504528'
});

// Jerarquía de permisos (qué rol puede aprobar qué)
const JERARQUIA_PERMISOS = Object.freeze([
    { id: ROLE_IDS.DEV, nombre: 'DEV', puedeAceptar: ['Alta Cupula', 'Responsable', 'ADM', 'Aux', 'Lid', 'Sub', 'Miembro', 'Tester'] },
    { id: ROLE_IDS.ALTA_CUPULA, nombre: 'Alta Cupula', puedeAceptar: ['Alta Cupula', 'Responsable', 'ADM', 'Aux', 'Lid', 'Sub', 'Miembro', 'Tester'] },
    { id: ROLE_IDS.RESPONSABLE, nombre: 'Responsable', puedeAceptar: ['Aux', 'Lid', 'Sub', 'Miembro', 'Tester'] },
    { id: ROLE_IDS.ADM, nombre: 'ADM', puedeAceptar: ['Lid', 'Sub', 'Miembro', 'Tester'] },
    { id: ROLE_IDS.AUX, nombre: 'Aux', puedeAceptar: ['Sub', 'Miembro', 'Tester'] }
]);

module.exports = {
    ROLE_IDS,
    AVAILABLE_ROLES,
    ROLES_AUTORIZADOS,
    ROLES_DM,
    ROLE_PREFIXES,
    ROLE_DISPLAY_NAMES,
    CHANNELS,
    USERS,
    JERARQUIA_PERMISOS
};