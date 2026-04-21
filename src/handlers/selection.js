/**
 * 🔽 HANDLER DE SELECT MENUS
 * ============================================================
 * Respuestas a string select menus.
 * Separado por responsabilidad única.
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { AVAILABLE_ROLES, CHANNELS, ROLE_IDS } = require('../config/roles');
const { crearEmbedSolicitud, enviarLog } = require('../services/discord');

/**
 * Manejar selección de rango
 * @param {Interaction} interaction
 * @param {Map} pendingVerifications - Verificaciones pendientes
 * @returns {Promise<boolean>} Si fue procesado
 */
async function handleSelectRango(interaction, pendingVerifications) {
    if (interaction.customId !== 'select_rango') return false;
    
    const rangoId = interaction.values[0];
    const rangoNombre = AVAILABLE_ROLES[rangoId];
    const datos = pendingVerifications.get(interaction.user.id);

    if (!datos) {
        await interaction.reply({ content: '❌ Tiempo expirado.', flags: 64 });
        return false;
    }

    const { nombreIC, idIC } = datos;
    pendingVerifications.delete(interaction.user.id);

    // Crear embed de solicitud
    const embed = crearEmbedSolicitud(interaction.user, nombreIC, idIC, rangoNombre);

    // Botones de acción
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('btn_aceptar').setLabel('Aceptar').setStyle(ButtonStyle.Success).setEmoji('✅'),
        new ButtonBuilder().setCustomId('btn_rechazar').setLabel('Rechazar').setStyle(ButtonStyle.Danger).setEmoji('❌')
    );

    // Enviar al canal de solicitudes
    const guild = interaction.guild;
    if (guild && CHANNELS.SOLICITUDES) {
        try {
            const canal = await guild.channels.fetch(CHANNELS.SOLICITUDES);
            if (canal && canal.type === 0) {
                await canal.send({ embeds: [embed], components: [row] });
            }
        } catch (e) {
            console.error('❌ Error al enviar solicitud:', e);
        }
    }

    await interaction.update({ content: '🎖️ **SOLICITUD ENVIADA**\n⏳ Pendiente de revision', components: [] });
    return true;
}

module.exports = {
    handleSelectRango
};