/**
 * 🔍 SERVICIO DE BÚSQUEDA DE USUARIOS
 * ============================================================
 * Lógica reutilizable para buscar usuarios en el servidor.
 * Sin acoplamiento - solo dependencias injected.
 */

/**
 * Buscar usuario por múltiples métodos
 * @param {Guild} guild - Servidor de Discord
 * @param {string} texto - Texto de búsqueda (mención, username, o partial)
 * @returns {Promise<GuildMember|null>} Miembro encontrado o null
 */
async function buscarUsuario(guild, texto) {
    if (!guild || !texto) return null;
    
    // Por mención <@!id> o <@id>
    const mentionMatch = texto.match(/<@!?(\d+)>/);
    if (mentionMatch) {
        try {
            return await guild.members.fetch(mentionMatch[1]);
        } catch (e) { /* no encontrado */ }
    }
    
    // Por username#discriminator
    if (texto.includes('#')) {
        const [username, discriminator] = texto.split('#');
        if (discriminator) {
            const user = guild.members.cache.find(m => 
                m.user.username === username && m.user.discriminator === discriminator
            );
            if (user) return user;
        }
    }
    
    // Por username o nickname exacto
    const textoLower = texto.toLowerCase();
    const user = guild.members.cache.find(m => 
        m.user.username.toLowerCase() === textoLower ||
        m.nickname?.toLowerCase() === textoLower
    );
    if (user) return user;
    
    // Por búsqueda parcial
    const candidatos = guild.members.cache.filter(m => 
        m.user.username.toLowerCase().includes(textoLower) ||
        m.nickname?.toLowerCase().includes(textoLower)
    );
    
    if (candidatos.size === 1) return candidatos.first();
    if (candidatos.size > 1) return null; // Ambiguo
    
    return null;
}

/**
 * Buscar usuario por ID
 * @param {Guild} guild - Servidor
 * @param {string} userId - ID del usuario
 * @returns {Promise<GuildMember|null>}
 */
async function buscarUsuarioPorId(guild, userId) {
    if (!guild || !userId) return null;
    try {
        return await guild.members.fetch(userId);
    } catch (e) {
        return null;
    }
}

module.exports = {
    buscarUsuario,
    buscarUsuarioPorId
};