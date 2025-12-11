import { AuthUser } from "../../models/auth-user.interface";

export interface AuthSlice {
    readonly user: AuthUser | null;
    readonly _tokenExpirationTimer: any;
    readonly isLoading: boolean;
}

export const initialAuthSlice: AuthSlice = {
    user: null,
    _tokenExpirationTimer: null,
    isLoading: false
}