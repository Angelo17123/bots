/**
 * 🔘 HANDLER DE BOTONES
 * ============================================================
 * Respuestas a botones.
 * Separado por responsabilidad única.
 */

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

/**
 * Crear modal de verificación
 * @returns {ModalBuilder}
 */
function crearModalVerificar() {
    const modal = new ModalBuilder()
        .setCustomId('modal_verificar')
        .setTitle('🛡️ Verificacion');

    const nombreIC = new TextInputBuilder()
        .setCustomId('input_nombre')
        .setLabel('✏️ Nombre IC')
        .setPlaceholder('Tu nombre')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(50);

    const idIC = new TextInputBuilder()
        .setCustomId('input_id')
        .setLabel('🎮 ID')
        .setPlaceholder('Tu ID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(20);

    modal.addComponents(
        new ActionRowBuilder().addComponents(nombreIC),
        new ActionRowBuilder().addComponents(idIC)
    );

    return modal;
}

/**
 * Manejar botón btn_verificar
 * @param {Interaction} interaction
 */
async function handleBtnVerificar(interaction) {
    const modal = crearModalVerificar();
    await interaction.showModal(modal);
}

/**
 * Crear botones de aceptar/rechazar solicitud
 * @returns {ActionRowBuilder}
 */
function crearBotonesSolicitud() {
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('btn_aceptar').setLabel('Aceptar').setStyle(ButtonStyle.Success).setEmoji('✅'),
        new ButtonBuilder().setCustomId('btn_rechazar').setLabel('Rechazar').setStyle(ButtonStyle.Danger).setEmoji('❌')
    );
}

/**
 * Crear botones deshabilitados ( después de acción )
 * @returns {ActionRowBuilder}
 */
function crearBotonesDeshabilitados() {
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('btn_aceptar').setLabel('Aceptar').setStyle(ButtonStyle.Success).setDisabled(true),
        new ButtonBuilder().setCustomId('btn_rechazar').setLabel('Rechazar').setStyle(ButtonStyle.Danger).setDisabled(true)
    );
}

/**
 * Manejar botón aceptar/rechazar
 * @param {Interaction} interaction
 * @returns {boolean} true si es btn_aceptar
 */
function esBotonAceptar(interaction) {
    return interaction.customId === 'btn_aceptar';
}

module.exports = {
    crearModalVerificar,
    handleBtnVerificar,
    crearBotonesSolicitud,
    crearBotonesDeshabilitados,
    esBotonAceptar
};