const TOKEN_STORAGE_KEY = "stayfit.accessToken";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export { getToken, setToken, clearToken };
