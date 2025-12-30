import { PartialStateUpdater } from "@ngrx/signals";
import { User } from "../../models/users/user.interface";
import { UsersSlice } from "./users.slice";
import { onSortUsers } from "./users.helpers";

export function selectUser(user: User): PartialStateUpdater<UsersSlice> {
    return _ => ({
        selectedUser: user
    });
}

export function setRole(role: 'User' | 'Master' | 'Admin'): PartialStateUpdater<UsersSlice> {
    return _ => ({
        currentPage: 1,
        role,
    });
}

export function setFilter(filter: 'All' | 'F-M' | 'OVA'): PartialStateUpdater<UsersSlice> {
    return _ => ({
        currentPage: 1,
        filter,
        role: filter === 'All' ? '' : 'User'
    });
}

export function setCurrentPage(currentPage: number): PartialStateUpdater<UsersSlice> {
    return _ => ({
        currentPage
    });
}

export function setUsers(users: User[]): PartialStateUpdater<UsersSlice> {
    let sortedusers = onSortUsers(users);
    return _ => ({
        users: sortedusers
    });
}