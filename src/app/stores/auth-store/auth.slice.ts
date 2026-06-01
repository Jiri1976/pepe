import { AuthUser } from '../../models/auth-user.interface';

export interface AuthSlice {
  readonly user: AuthUser | null;
  readonly _tokenExpirationTimer: any;
  readonly destinationSelected: boolean;
}

export const initialAuthSlice: AuthSlice = {
  user: null,
  _tokenExpirationTimer: null,
  destinationSelected: false,
};
