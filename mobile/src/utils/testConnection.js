import axios from 'axios';

const API_BASE = 'http://192.168.2.104:3000';

export const testConnection = async () => {
  try {
    console.log('🔍 Testando conexão com backend em:', API_BASE);

    const response = await axios.get(`${API_BASE}/health`, {
      timeout: 5000
    });

    console.log('✅ Conexão com backend OK:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Erro ao conectar com backend:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('   Causa: Backend não está respondendo');
      console.error('   Solução: Verificar se o backend está rodando');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.error('   Causa: Timeout na conexão');
      console.error('   Solução: Verificar se celular e PC estão na mesma rede Wi-Fi');
    } else if (error.message.includes('Network request failed')) {
      console.error('   Causa: Falha na requisição de rede');
      console.error('   Solução: Verificar IP do backend ou firewall');
    }

    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};
