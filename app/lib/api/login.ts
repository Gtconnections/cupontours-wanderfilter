export interface LoginCredentials {
  username?: string;
  password?: string;
}

export async function loginUser(credentials: LoginCredentials) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api';

  try {
    const response = await fetch(`${API_BASE_URL}/authenticate/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'skip-auth': 'true' // Replicado de tu código Angular
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Credenciales inválidas. Por favor, intenta de nuevo.');
    }

    const res = await response.json();
    
    // Por el JSON que me pasaste antes, a veces los datos vienen en la raíz ("res")
    // y en tu Angular venían dentro de "res.profile". Usamos un fallback para cubrir ambos.
    const profile = res.profile || res;

    // Guardamos todo en localStorage replicando la lógica de Angular
    if (typeof window !== 'undefined') {
      localStorage.setItem('isUserLoggedIn', 'true');
      localStorage.setItem('accessToken', profile.token);
      
      // Los objetos completos deben guardarse como string en localStorage nativo
      localStorage.setItem('userData', JSON.stringify(profile));
      
      if (res.subscription_status) {
        localStorage.setItem('subs_status', res.subscription_status);
      }
      
      localStorage.setItem('user_id', profile.id?.toString());
      localStorage.setItem('owner_id', profile.profile_id?.toString());
      localStorage.setItem('username', profile.username);
      localStorage.setItem('photo', profile.photo || '');

      // Mapeo numérico de posiciones (admin = 1, owner = 2, customer = 3)
      if (profile.position === 'admin') {
        localStorage.setItem('position', '1');
      } else if (profile.position === 'owner') {
        localStorage.setItem('position', '2');
      } else if (profile.position === 'customer') {
        localStorage.setItem('position', '3');
      }
    }

    return res;
  } catch (error) {
    console.error("Error en el login:", error);
    throw error;
  }
}