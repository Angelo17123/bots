/**
 * 📢 SERVICIO DE EMBEDS Y LOGS
 * ============================================================
 * Construcción de embeds y envío de logs.
 * Centralizado para consistencia.
 */

const { EmbedBuilder } = require('discord.js');
const { CHANNELS } = require('../config/roles');

/**
 * Crear embed básico
 * @param {string} titulo - Título
 * @param {string} descripcion - Descripción
 * @param {number} color - Color (default verde)
 * @returns {EmbedBuilder}
 */
function crearEmbed(titulo, descripcion, color = 3066993) {
    return new EmbedBuilder()
        .setTitle(titulo)
        .setDescription(descripcion)
        .setColor(color)
        .setTimestamp();
}

/**
 * Crear embed de log
 * @param {string} titulo - Título
 * @param {string} descripcion - Descripción
 * @param {number} color - Color
 * @param {string} footer - Texto de footer
 * @returns {EmbedBuilder}
 */
function crearEmbedLog(titulo, descripcion, color, footer = 'Staff Eventos - Log') {
    return new EmbedBuilder()
        .setTitle(titulo)
        .setDescription(descripcion)
        .setColor(color)
        .setFooter({ text: footer })
        .setTimestamp();
}

/**
 * Enviar log al canal de logs
 * @param {Guild} guild - Servidor
 * @param {string} titulo - Título
 * @param {string} descripcion - Descripción
 * @param {number} color - Color
 */
async function enviarLog(guild, titulo, descripcion, color = 4895) {
    if (!guild || !CHANNELS.LOGS) return;
    
    try {
        const canal = await guild.channels.fetch(CHANNELS.LOGS);
        if (canal && canal.type === 0) { // Text channel
            const embed = crearEmbedLog(titulo, descripcion, color);
            await canal.send({ embeds: [embed] });
        }
    } catch (e) {
        console.log(`⚠️ Log error: ${e.message}`);
    }
}

/**
 * Crear embed de solicitud
 * @param {User} usuario - Usuario que solicita
 * @param {string} nombreIC - Nombre IC
 * @param {string} idIC - ID personaje
 * @param {string} rango - Rango solicitado
 * @returns {EmbedBuilder}
 */
function crearEmbedSolicitud(usuario, nombreIC, idIC, rango) {
    return new EmbedBuilder()
        .setTitle('📋 Nueva Solicitud')
        .setDescription(`**Solicitante:** ${usuario}`)
        .setColor(255, 165, 0)
        .setThumbnail(usuario.displayAvatarURL({ dynamic: true, size: 128 }))
        .addFields(
            { name: 'Nombre IC', value: nombreIC, inline: true },
            { name: 'ID', value: idIC, inline: true },
            { name: 'Rango', value: rango, inline: true }
        )
        .setFooter({ text: `ID: ${usuario.id}` })
        .setTimestamp();
}

/**
 * Crear embed de aprobación DM
 * @param {string} nombreIC - Nombre IC
 * @param {string} idIC - ID personaje
 * @param {string} rango - Rango
 * @returns {EmbedBuilder}
 */
function crearEmbedAprobado(nombreIC, idIC, rango) {
    return new EmbedBuilder()
        .setTitle('🎪 SISTEMA DE VERIFICACIÓN — APROBADO')
        .setDescription('✨ **¡Bienvenido al Staff de Eventos!** ✨\n\nJuntos creamos experiencias únicas que se quedan en la memoria.')
        .setColor(3066993)
        .addFields(
            { name: '📝 Nombre IC', value: nombreIC, inline: true },
            { name: '🆔 ID de Personaje', value: idIC, inline: true },
            { name: '⭐ Rango Asignado', value: rango, inline: true }
        )
        .addFields(
            { name: '📌 Nota', value: 'Tu apodo ha sido actualizado en el servidor. Si no lo ves, contacta a un administrador.', inline: false }
        )
        .setFooter({ text: 'Staff Eventos — "Juntos creamos experiencias únicas"' })
        .setTimestamp();
}

/**
 * Crear embed de rechazo DM
 * @param {string} nombreIC - Nombre IC
 * @param {string} idIC - ID personaje
 * @param {string} rango - Rango solicitado
 * @returns {EmbedBuilder}
 */
function crearEmbedRechazado(nombreIC, idIC, rango) {
    return new EmbedBuilder()
        .setTitle('🎪 SOLICITUD — RECHAZADA')
        .setDescription('Tu solicitud no ha sido aprobada en esta ocasión.')
        .setColor(15158332)
        .addFields(
            { name: '📝 Nombre IC', value: nombreIC, inline: true },
            { name: '🆔 ID de Personaje', value: idIC, inline: true },
            { name: '⭐ Rango Solicitado', value: rango, inline: true }
        )
        .setFooter({ text: 'Staff Eventos' })
        .setTimestamp();
}

module.exports = {
    crearEmbed,
    crearEmbedLog,
    crearEmbedSolicitud,
    crearEmbedAprobado,
    crearEmbedRechazado,
    enviarLog
};