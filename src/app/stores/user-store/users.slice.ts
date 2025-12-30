import { User } from "../../models/users/user.interface";

export interface UsersSlice {
    readonly users: User[];
    readonly filter: 'All' | 'F-M' | 'OVA';
    readonly role: 'User' | 'Master' | 'Admin' | '';
    readonly selectedUser: User | null;
    readonly currentPage: number;
}

export const initialUsersSlice: UsersSlice = {
    users: [],
    filter: 'All',
    role: '',
    selectedUser: null,
    currentPage: 1
}