export interface AuthUser {
  name: string;
  email: string;
  role: string;
  destination: string;
  token: string;
  expiresIn: string;
  expireTime: number;
}

export interface SignalRUser {
  name: string;
  destination?: string | null;
  role?: string | null;
}
