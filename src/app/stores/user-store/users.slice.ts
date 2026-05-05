import { User } from "../../models/users.interface";

export interface UsersSlice {
    readonly users: User[];
    readonly filter: 'All' | 'F-M' | 'OVA';
    readonly role: 'User' | 'Master' | 'Admin' | '';
    readonly selectedUser: User | null;
    readonly currentPage: number;
    readonly userBlock: 'user' | 'proposal' | 'shift';
}

export const initialUsersSlice: UsersSlice = {
    users: [],
    filter: 'All',
    role: '',
    selectedUser: null,
    currentPage: 1,
    userBlock: 'user'
}