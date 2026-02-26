import { Platform } from 'react-native';

// Cambia esta constante cuando despliegues en Vercel:
// ejemplo: https://tu-proyecto.vercel.app
const DEPLOYED_API_URL = '';

// Ejemplo Tailscale (si quieres probar sin Vercel):
// const DEPLOYED_API_URL = 'http://100.x.y.z:4000';

export const API_BASE_URL = DEPLOYED_API_URL || (Platform.OS === 'android'
  ? 'http://10.0.2.2:4000'
  : 'http://localhost:4000');
