/**
 * 🤖 BOT PRINCIPAL - STAFF EVENTOS
 * ============================================================
 * Entry point que orquesta todos los módulos.
 * Bajo acoplamiento - cada cosa en su lugar.
 */

// Carga de configuración
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// Configuración
const { CHANNELS, ROLE_IDS, JERARQUIA_PERMISOS, ROLES_AUTORIZADOS, AVAILABLE_ROLES } = require('./config/roles');
const { buscarUsuario } = require('./services/usuario');
const generarNickname = require('./services/nickname').generarNickname;
const { crearEmbedLog, crearEmbedAprobado, crearEmbedRechazado, enviarLog } = require('./services/discord');

// Handlers
const { crearComandos, tienePermisoDM, handlePanel, handleDm, handleClearLogs, handlePersonalizar, handleRestaurar, handleRegistrar } = require('./handlers/commands');
const { handleBtnVerificar, crearBotonesDeshabilitados, esBotonAceptar } = require('./handlers/buttons');
const { handleModalVerificar, handleModalDm, handleModalRegistrar } = require('./handlers/modals');
const { handleSelectRango } = require('./handlers/selection');

// Estado de la aplicación (inyectado, no hardcodeado)
const state = {
    pendingVerifications: new Map(),
    usuariosRegistrados: new Map(),
    usuariosPersonalizado: new Map()
};

// ============================================================
// CLIENTE DISCORDS
// ============================================================
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// ============================================================
// EVENTOS
// ============================================================

client.once('clientReady', async () => {
    console.log(`✅ Bot conectado: ${client.user.tag}`);
    console.log(`📛 ID: ${client.user.id}`);
    
    const guild = client.guilds.cache.first();
    if (guild) {
        console.log(`📗 Servidor: ${guild.name}`);
        
        // Eliminar comandos antiguos que no usamos
        try {
            const comandos = await guild.commands.fetch();
            for (const [id, cmd] of comandos) {
                if (['dm_historial', 'dm_preview'].includes(cmd.name)) {
                    await cmd.delete();
                    console.log(`🗑️ /${cmd.name} eliminado`);
                }
            }
            
            await crearComandos(guild);
        } catch (e) {
            console.error('❌ Error:', e);
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;
            
            if (commandName === 'panel') await handlePanel(interaction);
            else if (commandName === 'dm') await handleDm(interaction);
            else if (commandName === 'clear_logs') await handleClearLogs(interaction);
            else if (commandName === 'personalizar') await handlePersonalizar(interaction, state.usuariosPersonalizado);
            else if (commandName === 'restaurar') await handleRestaurar(interaction, state.usuariosPersonalizado, state.usuariosRegistrados);
            else if (commandName === 'registrar') await handleRegistrar(interaction);
        }
        else if (interaction.isButton()) {
            if (interaction.customId === 'btn_verificar') {
                await handleBtnVerificar(interaction);
            }
            else if (interaction.customId === 'btn_aceptar' || interaction.customId === 'btn_rechazar') {
                await handleAcceptReject(interaction);
            }
        }
        else if (interaction.isStringSelectMenu()) {
            await handleSelectRango(interaction, state.pendingVerifications);
        }
        else if (interaction.isModalSubmit()) {
            const { customId } = interaction;
            
            if (customId === 'modal_verificar') {
                await handleModalVerificar(interaction, state.pendingVerifications);
            }
            else if (customId === 'modal_dm') {
                await handleModalDm(interaction);
            }
            else if (customId === 'modal_registrar') {
                await handleModalRegistrar(interaction, state.usuariosRegistrados);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;
        const guild = newMember.guild;
        
        // Detectar cambios de rol relevantes
        const { ROLE_IDS, ROLE_PREFIXES } = require('./config/roles');
        const availableRoleIds = Object.keys(ROLE_PREFIXES);
        
        const addedRoles = newRoles.filter(role => !oldRoles.has(role.id) && availableRoleIds.includes(role.id));
        const removedRoles = oldRoles.filter(role => !newRoles.has(role.id) && availableRoleIds.includes(role.id));
        
        // Log de cambios de rol
        if (addedRoles.size > 0 || removedRoles.size > 0) {
            for (const role of addedRoles.values()) {
                await enviarLog(guild, '🔔 Rol Añadido', `**Usuario:** ${newMember.user.username}\n**Rol:** ${role.name}`, 3066993);
            }
            for (const rol of removedRoles.values()) {
                await enviarLog(guild, '🔔 Rol Removido', `**Usuario:** ${newMember.user.username}\n**Rol:** ${rol.name}`, 15158332);
            }
        }
        
        // Auto-nickname
        let rolAplicar = null;
        for (const [id, prefijo] of Object.entries(ROLE_PREFIXES)) {
            if (newRoles.has(id)) {
                rolAplicar = { id, prefijo };
                break;
            }
        }
        
        const datosUsuario = state.usuariosRegistrados.get(newMember.user.id);
        const nickActual = newMember.nickname;
        
        // Detectar cambio manual de nickname
        if (rolAplicar && datosUsuario) {
            const { nombreIC, idIC } = datosUsuario;
            const nickEsperado = generarNickname(rolAplicar.id, nombreIC, idIC);
            
            if (nickActual && nickActual !== nickEsperado && !state.usuariosPersonalizado.has(newMember.user.id)) {
                state.usuariosPersonalizado.set(newMember.user.id, true);
                console.log(`✨ Apodo personalizado detectado: ${newMember.user.tag} → "${nickActual}"`);
            }
        }
        
        // Respetar apodo personalizado
        if (state.usuariosPersonalizado.has(newMember.user.id)) {
            return;
        }
        
        if (rolAplicar && datosUsuario) {
            const { nombreIC, idIC } = datosUsuario;
            const nuevoNick = generarNickname(rolAplicar.id, nombreIC, idIC);
            
            if (nickActual !== nuevoNick) {
                try {
                    await newMember.setNickname(nuevoNick);
                    console.log(`📛 Nickname actualizado: ${newMember.user.tag} → ${nuevoNick}`);
                } catch (e) {
                    console.log(`⚠️ Error nick: ${e.message}`);
                }
            }
        }
        else if (!rolAplicar && datosUsuario && nickActual) {
            const tieneAlgunRol = Object.keys(ROLE_PREFIXES).some(id => newRoles.has(id));
            if (!tieneAlgunRol) {
                const tieneFormatoEVT = nickActual.includes('🎪') || nickActual.includes('EVT') || nickActual.includes('EC') || nickActual.includes('INT');
                if (tieneFormatoEVT && !state.usuariosPersonalizado.has(newMember.user.id)) {
                    try {
                        await newMember.setNickname(null);
                        console.log(`📛 Nickname removido: ${newMember.user.tag}`);
                    } catch (e) {}
                }
            }
        }
    } catch (error) {
        console.error('❌ Error en detector de roles:', error);
    }
});

// ============================================================
// HANDLER DE ACEPTAR/RECHAZAR SOLICITUD
// ============================================================

async function handleAcceptReject(interaction) {
    const esAceptar = esBotonAceptar(interaction);
    const member = interaction.member;
    
    if (!member) {
        await interaction.reply({ content: '❌ Error', flags: 64 });
        return;
    }
    
    // Verificar permisos
    const userRoles = member.roles.cache;
    const rolAutorizador = Object.keys(ROLES_AUTORIZADOS).find(id => userRoles.has(id));
    
    if (!rolAutorizador) {
        await interaction.reply({ content: '❌ Sin permiso.', flags: 64 });
        return;
    }
    
    const jerarquia = JERARQUIA_PERMISOS.find(j => j.id === rolAutorizador);
    if (!jerarquia) {
        await interaction.reply({ content: '❌ Sin permiso.', flags: 64 });
        return;
    }
    
    // Obtener datos de la solicitud
    const embed = interaction.message.embeds[0];
    const fields = embed.data.fields;
    const rangoSolicitado = fields.find(f => f.name === 'Rango')?.value || '';
    
    // Verificación: solo DEV o Alta Cupula pueden aprobar Alta Cupula
    const esAltaCupula = rangoSolicitado === 'Alta Cupula';
    const tieneAltaCupula = userRoles.has(ROLE_IDS.ALTA_CUPULA);
    const tieneDevRol = userRoles.has(ROLE_IDS.DEV);
    
    if (esAltaCupula && !tieneAltaCupula && !tieneDevRol) {
        await interaction.reply({ content: '❌ Solo DEV o Alta Cupula pueden aceptar Alta Cupula.', flags: 64 });
        return;
    }
    
    if (!jerarquia.puedeAceptar.includes(rangoSolicitado)) {
        await interaction.reply({ content: `❌ No puedes aceptar ${rangoSolicitado}.`, flags: 64 });
        return;
    }
    
    // Deshabilitar botones
    await interaction.update({ components: [crearBotonesDeshabilitados()] });
    
    // Obtener ID del solicitante
    const footer = embed.footer.text;
    const userIdMatch = footer.match(/ID:\s*(\d+)/);
    const solicitanteId = userIdMatch ? userIdMatch[1] : null;
    
    // Log
    const guild = interaction.guild;
    if (guild && CHANNELS.LOGS) {
        try {
            const canal = await guild.channels.fetch(CHANNELS.LOGS);
            if (canal && canal.type === 0) {
                const embedLog = crearEmbedLog(
                    esAceptar ? '✅ Solicitud Aprobada' : '❌ Solicitud Rechazada',
                    `**Autorizador:** ${interaction.user}`,
                    esAceptar ? 3066993 : 15158332
                ).addFields(
                    { name: 'Solicitante ID', value: solicitanteId || 'desconocido', inline: true },
                    { name: 'Accion', value: esAceptar ? 'Aprobado' : 'Rechazado', inline: true }
                );
                await canal.send({ embeds: [embedLog] });
            }
        } catch (e) {}
    }
    
    await interaction.followUp({ content: esAceptar ? '✅ Aceptado.' : '❌ Rechazado.', flags: 64 });
    
    // Procesar aceptación
    if (esAceptar && solicitanteId) {
        const nombre = fields.find(f => f.name === 'Nombre IC')?.value || '';
        const idIC = fields.find(f => f.name === 'ID')?.value || '';
        const rango = rangoSolicitado;
        
        if (guild) {
            try {
                const miembro = await guild.members.fetch(solicitanteId);
                if (miembro) {
                    // Guardar datos
                    state.usuariosRegistrados.set(solicitanteId, { nombreIC: nombre, idIC: idIC });
                    console.log(`💾 Datos guardados: ${nombre} | ${idIC}`);
                    
                    // Asignar rol
                    const rolId = Object.entries(AVAILABLE_ROLES).find(([id, name]) => name === rango)?.[0];
                    if (rolId) {
                        const nuevoRol = await guild.roles.fetch(rolId);
                        if (nuevoRol) {
                            await miembro.roles.add(nuevoRol);
                            
                            // Remover roles anteriores
                            setTimeout(async () => {
                                for (const [rolIdAntiguo] of Object.entries(AVAILABLE_ROLES)) {
                                    if (rolIdAntiguo === rolId) continue;
                                    const rolAntiguo = await guild.roles.fetch(rolIdAntiguo);
                                    if (rolAntiguo && miembro.roles.cache.has(rolAntiguo.id)) {
                                        try { await miembro.roles.remove(rolAntiguo); } catch (e) {}
                                    }
                                }
                            }, 1000);
                        }
                    }
                    
                    // Setear nickname
                    const nuevoNickname = generarNickname(rolId, nombre, idIC);
                    try {
                        await miembro.setNickname(nuevoNickname);
                        console.log(`📛 Nickname aplicado: ${nuevoNickname}`);
                    } catch (e) {
                        console.log(`⚠️ Error nick: ${e.message}`);
                    }
                    
                    // Enviar DM
                    try {
                        const embedDM = crearEmbedAprobado(nombre, idIC, rango);
                        await miembro.send({ embeds: [embedDM] });
                    } catch (e) {
                        console.log(`⚠️ Error DM: ${e.message}`);
                    }
                }
            } catch (e) {
                console.error('Error:', e);
            }
        }
    }
}

// ============================================================
// INICIAR
// ============================================================
console.log('🎮 Bot de Verificacion - Staff Eventos (Refactorizado)');

const TOKEN = process.env.DISCORD_TOKEN || '';
if (!TOKEN) {
    console.error('❌ ERROR: No hay token en .env');
    process.exit(1);
}

client.login(TOKEN);
process.on('unhandledRejection', (error) => console.error('❌ Error:', error));