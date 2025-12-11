import { AuthUser } from "../../models/auth-user.interface";
import { User } from "../../models/users/user.interface";

export interface UsersSlice {
    readonly users: User[];
    readonly isLoading: boolean;
    readonly filter: 'All' | 'F-M' | 'OVA';
    readonly role: 'User' | 'Master' | 'Admin';
}

export const initialUsersSlice: UsersSlice = {
    users: [],
    isLoading: false,
    filter: 'All',
    role: 'User'
}