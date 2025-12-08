
export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export function hasToken() {
  return !!getAccessToken();
}


export function saveTrainerTokens(access: string, refresh: string) {
  localStorage.setItem("trainer_accessToken", access);
  localStorage.setItem("trainer_refreshToken", refresh);
}

export function getTrainerAccessToken() {
  return localStorage.getItem("trainer_accessToken");
}

export function getTrainerRefreshToken() {
  return localStorage.getItem("trainer_refreshToken");
}

export function clearTrainerTokens() {
  localStorage.removeItem("trainer_accessToken");
  localStorage.removeItem("trainer_refreshToken");
}
