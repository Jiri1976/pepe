import { AuthUser } from "../../models/auth-user.interface";
import { User } from "../../models/users/user.interface";

export interface UsersSlice {
    readonly users: User[];
    readonly isLoading: boolean;
    readonly filter: 'All' | 'F-M' | 'OVA';
    readonly role: 'User' | 'Master' | 'Admin' | '';
    readonly selectedUser: User | null;
    readonly currentPage: number;
    readonly isSaving: boolean;
    readonly isDeleting: boolean;
}

export const initialUsersSlice: UsersSlice = {
    users: [],
    isLoading: false,
    filter: 'All',
    role: '',
    selectedUser: null,
    currentPage: 1,
    isSaving: false,
    isDeleting: false
}