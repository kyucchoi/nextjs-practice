export function handleAuthError(response: Response): void {
  if (response.status === 401 || response.status === 403) {
    window.location.href = '/login';
  }
}
