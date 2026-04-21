/**
 * Dashboard API Client para el Bot de Discord
 */

const axios = require('axios');

class DashboardAPIClient {
  constructor() {
    this.apiKey = '';
    this.baseURL = 'http://localhost:3000/api';
    this.enabled = false;
  }

  config(options) {
    this.apiKey = options.apiKey || '';
    this.baseURL = options.dashboardUrl || 'http://localhost:3000/api';
    this.enabled = !!this.apiKey;
    console.log(`[DashboardAPI] ${this.enabled ? '✅ Habilitado' : '⚠️ Deshabilitado'} - ${this.baseURL}`);
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    };
  }

  async request(method, endpoint, data = null) {
    if (!this.enabled) return null;
    
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: this.getHeaders(),
        data,
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('[DashboardAPI] Error:', error.message);
      return null;
    }
  }

  // Solicitudes
  async nuevaSolicitud(datos) {
    return this.request('POST', '/solicitudes', datos);
  }

  async actualizarSolicitud(id, estado) {
    return this.request('PATCH', `/solicitudes/${id}/estado`, { estado });
  }

  // Logs
  async crearLog(datos) {
    return this.request('POST', '/logs', datos);
  }

  // Usuarios
  async registrarUsuario(datos) {
    return this.request('POST', '/usuarios', datos);
  }

  // Stats
  async actualizarStats(bot_id, stats) {
    return this.request('POST', '/stats', { bot_id, ...stats });
  }
}

// Singleton
module.exports = new DashboardAPIClient();
