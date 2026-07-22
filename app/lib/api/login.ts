// lib/api/login.ts

export interface LoginCredentials {
  username?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  id: string | number; // user_id
  profile_id: string | number; // 🔥 CAMBIADO: ahora es requerido
  username: string;
  email?: string;
  position: string;
  fullName?: string;
  [key: string]: unknown;
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api';
  API_BASE_URL = API_BASE_URL.replace(/\/$/, "");

  const response = await fetch(`${API_BASE_URL}/authenticate/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorMsg = 'Credenciales inválidas.';
    try {
      const errorData = JSON.parse(responseText);
      errorMsg = errorData[0] || errorData.message || errorData.detail || errorMsg;
    } catch (e) {
      errorMsg = responseText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  const data = JSON.parse(responseText);

  // Shape of the backend response varies (array/object, wrapped in .data/.user/.profile), so it's
  // handled as a loosely-typed record rather than forcing a rigid interface onto it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeResponse = (input: any): AuthResponse => {
    let rawData = input;
    if (Array.isArray(rawData)) {
      rawData = rawData[0] || {};
    }

    if (rawData.data) {
      rawData = rawData.data;
    }

    const userData = rawData.user || rawData.profile || rawData.userData || rawData;

    const token = rawData.token || 
                  rawData.access_token || 
                  rawData.accessToken || 
                  rawData.jwt ||
                  rawData.authorization?.token ||
                  rawData.auth?.token ||
                  userData.token ||
                  null;

    // 🔥 EL PROFILE_ID VIENE DIRECTO EN rawData.profile_id
    // Tu JSON: { "profile_id": 319, "id": 365, ... }
    const profileId = rawData.profile_id || 
                      userData.profile_id ||
                      null;

    // 🔥 EL USER_ID ES rawData.id (365)
    const userId = rawData.id || 
                   userData.id || 
                   userData.user_id || 
                   userData.uid || 
                   userData.userId ||
                   '';

    // 🔥 SI NO HAY PROFILE_ID, USAR userId COMO FALLBACK (pero debería existir)
    const finalProfileId = profileId || userId;

    const username = rawData.username || 
                     userData.username || 
                     userData.name || 
                     userData.user_name ||
                     userData.email?.split('@')[0] ||
                     'usuario';

    const email = rawData.email || 
                  userData.email || 
                  userData.email_address ||
                  '';

    const position = rawData.position || 
                     userData.position || 
                     userData.role || 
                     userData.user_type ||
                     userData.userType ||
                     userData.rol ||
                     'customer';

    const fullName = rawData.full_name || 
                     rawData.fullName || 
                     userData.full_name || 
                     userData.fullName || 
                     userData.display_name ||
                     userData.displayName ||
                     userData.name ||
                     username;

    return {
      token: token,
      id: userId,           // ← 365
      profile_id: finalProfileId, // ← 319
      username: username,
      email: email,
      position: position.toLowerCase(),
      fullName: fullName,
      _raw: rawData,
      _user: userData
    };
  };

  const normalizedData = normalizeResponse(data);
  
  if (process.env.NODE_ENV === 'development') {
  }

  return normalizedData;
}