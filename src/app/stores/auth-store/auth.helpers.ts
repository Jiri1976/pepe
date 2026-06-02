import { jwtDecode } from 'jwt-decode';
import { AuthUser } from '../../models/auth-user.interface';

const SELECTED_DESTINATION_KEY = 'selectedDestination';

export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return false;
  }
  const decodedToken: any = jwtDecode(token!);
  let date = new Date(decodedToken.exp * 1000);
  const expirationTime = date.getTime() - new Date().getTime();
  return expirationTime <= 0;
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

function getDestinations(destination: string | string[] | null): string[] {
  if (Array.isArray(destination)) {
    return destination;
  }

  return destination ? [destination] : [];
}

function getPrimaryDestination(destination: string | string[] | null): string {
  return getDestinations(destination)[0] ?? '';
}

export function getSelectedDestination(token: string): string | null {
  const decodedToken: any = jwtDecode(token);
  const selectedDestination = localStorage.getItem(SELECTED_DESTINATION_KEY);
  const destinations = getDestinations(decodedToken.destination);

  if (selectedDestination && destinations.includes(selectedDestination)) {
    return selectedDestination;
  }

  localStorage.removeItem(SELECTED_DESTINATION_KEY);
  return null;
}

export function saveSelectedDestination(destination: string): void {
  localStorage.setItem(SELECTED_DESTINATION_KEY, destination);
}

export function clearSelectedDestination(): void {
  localStorage.removeItem(SELECTED_DESTINATION_KEY);
}

export function hasMoreThanOneDestination(token: string): boolean {
  const decodedToken: any = jwtDecode(token!);
  const destination = decodedToken.destination;

  if (Array.isArray(destination)) {
    return destination.length > 1;
  }

  return false;
}

export function setUserDetail(token: string): AuthUser | null {
  const decodedToken: any = jwtDecode(token!);
  let date = new Date(decodedToken.exp * 1000);
  const expirationTime = date.getTime() - new Date().getTime();
  if (expirationTime <= 0) {
    return null;
  }

  const selectedDestination = getSelectedDestination(token);

  return {
    name: decodedToken.name,
    email: decodedToken.email,
    role: decodedToken.role,
    destination:
      selectedDestination ?? getPrimaryDestination(decodedToken.destination),
    token: token!,
    expiresIn: date.toString(),
    expireTime: expirationTime,
  };
}

export function mustSelectDestination(
  user: AuthUser | null,
  destinationSelected: boolean,
): boolean {
  return (
    !!user &&
    user.role === 'Master' &&
    hasMoreThanOneDestination(user.token) &&
    destinationSelected === false
  );
}
