/**
 * 🎮 HANDLER DE COMANDOS SLASH
 * ============================================================
 * Todos los comandos /slash en un solo lugar.
 * Bajo acoplamiento - usa servicios injectados.
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js');
const { ROLES_DM, ROLES_AUTORIZADOS, ROLE_IDS } = require('../config/roles');
const { crearEmbed } = require('../services/discord');

// Comandos disponibles
const COMMANDOS = Object.freeze([
    { name: 'panel', description: 'Sistema de verificación del staff' },
    { name: 'dm', description: 'Enviar mensaje a todos' },
    { name: 'clear_logs', description: 'Borrar mensajes del canal de logs' },
    { name: 'registrar', description: 'Registrar datos de usuario manualmente' },
    { name: 'personalizar', description: 'Usar mi propio apodo (no será cambiado)' },
    { name: 'restaurar', description: 'Volver al apodo automático del sistema' }
]);

/**
 * Crear todos los comandos en el servidor
 * @param {Guild} guild - Servidor
 */
async function crearComandos(guild) {
    for (const cmd of COMMANDOS) {
        await guild.commands.create(cmd);
    }
    console.log('✅ Comandos creados');
}

/**
 * Verificar si tiene permiso para DM
 * @param {GuildMember} member - Miembro
 * @returns {boolean}
 */
function tienePermisoDM(member) {
    if (!member) return false;
    return member.roles.cache.has(ROLE_IDS.DEV) ||
           member.roles.cache.has(ROLE_IDS.ALTA_CUPULA) ||
           member.roles.cache.has(ROLE_IDS.RESPONSABLE) ||
           member.roles.cache.has(ROLE_IDS.ADM) ||
           member.roles.cache.has(ROLE_IDS.AUX);
}

/**
 * Manejar comando /panel
 * @param {Interaction} interaction
 */
async function handlePanel(interaction) {
    const embed = crearEmbed(
        '🛡️ Sistema de Verificacion | Staff Eventos',
        '**BIENVENIDO AL SISTEMA DE VERIFICACION**\nSolicita tu acceso al staff',
        25
    ).addFields(
        { name: '📋 Como funciona?', value: '1. Haz clic en "Verificarse"\n2. Completa el formulario\n3. Selecciona tu rango\n4. Espera autorizacion', inline: true },
        { name: '📝 Datos requeridos', value: '• Nombre IC\n• ID de personaje\n• Rango solicitado', inline: true },
        { name: '⚡ Nota', value: 'Alta Cupula solo puede ser aprobado por DEV o Alta Cupula', inline: true }
    ).setFooter({ text: 'Staff Eventos v2.0' });

    const button = new ButtonBuilder()
        .setCustomId('btn_verificar')
        .setLabel('Verificarse')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🛡️');

    await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] });
}

/**
 * Manejar comando /dm
 * @param {Interaction} interaction
 */
async function handleDm(interaction) {
    if (!tienePermisoDM(interaction.member)) {
        await interaction.reply({ content: '❌ No tienes permiso.', flags: 64 });
        return;
    }

    const modal = new ModalBuilder()
        .setCustomId('modal_dm')
        .setTitle('📨 Menu de Mensajes');

    const input = new TextInputBuilder()
        .setCustomId('input_mensaje')
        .setLabel('Mensaje')
        .setPlaceholder('Escribe...')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1500);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
}

/**
 * Manejar comando /clear_logs
 * @param {Interaction} interaction
 */
async function handleClearLogs(interaction) {
    if (!tienePermisoDM(interaction.member)) {
        await interaction.reply({ content: '❌ No tienes permiso.', flags: 64 });
        return;
    }

    await interaction.reply({ content: '🧹 Borrando mensajes...', flags: 64 });

    const guild = interaction.guild;
    const { CHANNELS } = require('../config/roles');
    
    if (guild && CHANNELS.LOGS) {
        try {
            const canal = await guild.channels.fetch(CHANNELS.LOGS);
            if (canal && canal.type === 0) {
                let borrados = 0;
                while (true) {
                    const mensajes = await canal.messages.fetch({ limit: 100 });
                    if (mensajes.size === 0) break;

                    for (const [id, msg] of mensajes) {
                        await msg.delete();
                        borrados++;
                    }
                    await new Promise(r => setTimeout(r, 500));
                }
                await interaction.followUp({ content: `✅ Se borraron ${borrados} mensajes.`, flags: 64 });
            }
        } catch (e) {
            await interaction.followUp({ content: `❌ Error: ${e.message}`, flags: 64 });
        }
    }
}

/**
 * Manejar comando /personalizar
 * @param {Interaction} interaction
 * @param {Map} usuariosPersonalizado - Mapa de usuarios
 */
async function handlePersonalizar(interaction, usuariosPersonalizado) {
    usuariosPersonalizado.set(interaction.user.id, true);

    await interaction.reply({ 
        content: `✨ **Apodo personalizado guardado**\n\nTu apodo \`${interaction.member.nickname || interaction.user.username}\` será respetado.\n\nUsa \`/restaurar\` para volver al apodo automático.`, 
        flags: 64 
    });
}

/**
 * Manejar comando /restaurar
 * @param {Interaction} interaction
 * @param {Map} usuariosPersonalizado - Mapa de usuarios
 * @param {Map} usuariosRegistrados - Mapa de datos
 */
async function handleRestaurar(interaction, usuariosPersonalizado, usuariosRegistrados) {
    usuariosPersonalizado.delete(interaction.user.id);

    const datosUsuario = usuariosRegistrados.get(interaction.user.id);
    if (!datosUsuario) {
        await interaction.reply({ content: '❌ No tienes datos registrados. Usa el sistema de verificación primero.', flags: 64 });
        return;
    }

    // Buscar rol actual
    const { ROLE_IDS, ROLE_PREFIXES } = require('../config/roles');
    const member = interaction.member;
    let rolAplicar = null;
    
    for (const [id, prefijo] of Object.entries(ROLE_PREFIXES)) {
        if (member.roles.cache.has(id)) {
            rolAplicar = { id, prefijo };
            break;
        }
    }

    if (rolAplicar) {
        const { nombreIC, idIC } = datosUsuario;
        const nuevoNick = `${rolAplicar.prefijo} ${nombreIC} | ${idIC}`;

        try {
            await member.setNickname(nuevoNick);
            await interaction.reply({ content: `✅ **Apodo restaurado**\n\n${nuevoNick}`, flags: 64 });
        } catch (e) {
            await interaction.reply({ content: `❌ Error: ${e.message}`, flags: 64 });
        }
    } else {
        await interaction.reply({ content: '❌ No tienes un rol de staff asignado.', flags: 64 });
    }
}

/**
 * Manejar comando /registrar
 * @param {Interaction} interaction
 */
async function handleRegistrar(interaction) {
    if (!tienePermisoDM(interaction.member)) {
        await interaction.reply({ content: '❌ No tienes permiso.', flags: 64 });
        return;
    }

    const modal = new ModalBuilder()
        .setCustomId('modal_registrar')
        .setTitle('📝 Registrar Usuario');

    const usuarioInput = new TextInputBuilder()
        .setCustomId('input_usuario')
        .setLabel('👤 Usuario')
        .setPlaceholder('Usuario#0000 o @mencion')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const nombreIC = new TextInputBuilder()
        .setCustomId('input_nombre')
        .setLabel('✏️ Nombre IC')
        .setPlaceholder('Nombre del personaje')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(50);

    const idIC = new TextInputBuilder()
        .setCustomId('input_id')
        .setLabel('🎮 ID')
        .setPlaceholder('ID del personaje')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(20);

    modal.addComponents(
        new ActionRowBuilder().addComponents(usuarioInput),
        new ActionRowBuilder().addComponents(nombreIC),
        new ActionRowBuilder().addComponents(idIC)
    );

    await interaction.showModal(modal);
}

module.exports = {
    COMMANDOS,
    crearComandos,
    tienePermisoDM,
    handlePanel,
    handleDm,
    handleClearLogs,
    handlePersonalizar,
    handleRestaurar,
    handleRegistrar
};