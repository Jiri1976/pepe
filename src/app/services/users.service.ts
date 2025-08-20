import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { User } from "../models/users/user.interface";
import { UserDestination } from "../models/users/userDestination.interface";

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private PER_PAGE = 10;
    private http = inject(HttpClient);
    private BASE_ROUTE = environment.AUTHENTICATION_PATH;
    private initialUserDestinationFM: UserDestination = { id: 0, userId: 0, destination: 'F-M', positions: [] };
    private initialUserDestinationOVA: UserDestination = { id: 0, userId: 0, destination: 'OVA', positions: [] };
    private initialUser: User = { id: 0, name: '', surname: '', email: '', password: "", role: 'User', destinations: [this.initialUserDestinationFM, this.initialUserDestinationOVA], nick: '', isActive: true, image: null };
    users = signal<User[]>([]);
    user = signal<User>(this.initialUser);
    selectedList = signal<number>(6);
    filteredUsers = signal<User[]>([]);
    currentPage = signal<number>(1);
    filter = signal<'All' | 'F-M' | 'OVA'>('All');
    role = signal<'User' | 'Master' | 'Admin'>('User');
    hasNextPage = signal<boolean>(false);
    hasPreviousPage = signal<boolean>(false);
    lastPage = signal<number>(1);

    clearUser() {
        this.user.set(this.initialUser);
    }

    setUser(user: User) {
        this.user.set(user);
    }

    setUsers(users: User[]) {
        this.users.set(users);
    }

    addUser(user: User) {
        let _users = [...this.users()];
        _users.push(user);
        _users = this.sortUsers(_users);
        this.users.set(_users);
        this.setUsers(_users);
        this.filteredUsers.set(this.filterUsers(_users));
        this.selectList(this.selectedList());
    }

    selectList(value: number, pageNumber?: number) {
        this.selectedList.set(value);
        if (!pageNumber) {
            this.currentPage.set(1);
        } else {
            this.currentPage.set(pageNumber);
        }
        if (value === 1) {
            this.filter.set('F-M');
            let _users = this.users().filter(u => this.role() === 'Admin' ? u.role === this.role() : ((u.destinations[0].destination === this.filter() && u.destinations[0]?.positions?.length! > 0 && u.role === this.role()) || (u.destinations[1].destination === this.filter() && u.destinations[1]?.positions?.length! > 0 && u.role === this.role())));
            this.filteredUsers.set(this.filterUsers(_users));
        } else if (value === 2) {
            this.filter.set('OVA');
            let _users = this.users().filter(u => this.role() === 'Admin' ? u.role === this.role() : ((u.destinations[0].destination === this.filter() && u.destinations[0]?.positions?.length! > 0 && u.role === this.role()) || (u.destinations[1].destination === this.filter() && u.destinations[1]?.positions?.length! > 0 && u.role === this.role())));
            this.filteredUsers.set(this.filterUsers(_users));
        } else if (value === 3) {
            this.role.set('User');
            let _users = this.users().filter(u => this.filter() === 'All' ? u.role === this.role() : ((u.destinations[0].destination === this.filter() && u.destinations[0]?.positions?.length! > 0 && u.role === this.role()) || (u.destinations[1].destination === this.filter() && u.destinations[1]?.positions?.length! > 0 && u.role === this.role())));
            this.filteredUsers.set(this.filterUsers(_users));
        } else if (value === 4) {
            this.role.set('Master');
            let _users = this.users().filter(u => this.filter() === 'All' ? u.role === this.role() : ((u.destinations[0].destination === this.filter() && u.destinations[0]?.positions?.length! > 0 && u.role === this.role()) || (u.destinations[1].destination === this.filter() && u.destinations[1]?.positions?.length! > 0 && u.role === this.role())));
            this.filteredUsers.set(this.filterUsers(_users));
        } else if (value === 5) {
            this.role.set('Admin');
            let _users = this.users().filter(u => u.role === this.role());
            this.filteredUsers.set(this.filterUsers(_users));
        } else if (value === 6) {
            this.filter.set('All');
            let _users = [...this.users()];
            this.filteredUsers.set(this.filterUsers(_users));
        }
    }

    getUsers(isAdmin: boolean, destination?: string) {
        let url = '';
        if (isAdmin) {
            url = this.BASE_ROUTE + 'authentication/GetAllUsers';
        } else {
            url = this.BASE_ROUTE + `authentication/GetListOfUsers?destination=${destination}`;
        }
        return this.http.get<Response>(url);
    }

    getProposalUsers(destination: string) {
        let url = this.BASE_ROUTE + `authentication/GetListOfUsers?destination=${destination}`;
        return this.http.get<Response>(url);
    }

    createUser(_user: User) {
        const url = this.BASE_ROUTE + `authentication/Register`;
        return this.http.post<Response>(url, _user);
    }

    getUser(userId: number) {
        const url = this.BASE_ROUTE + `authentication/GetUser/${userId}`;
        return this.http.get<Response>(url);
    }

    updateUser(user: User) {
        const url = this.BASE_ROUTE + `authentication/Update`;
        return this.http.post<Response>(url, user);
    }

    deleteUser(userId: number) {
        const url = this.BASE_ROUTE + `authentication/delete/${userId}`;
        return this.http.delete<Response>(url);
    }

    onUpdateUser(_user: User) {
        let _users = [...this.users()];
        _users = _users.map(user => {
            if (user.id === _user.id) {
                return { ...user, name: _user.name, surname: _user.surname, email: _user.email, role: _user.role, destinations: _user.destinations, isActive: _user.isActive, image: _user.image };
            } else {
                return user;
            }
        });
        _users = this.sortUsers(_users);
        this.setUsers(_users);
        this.filteredUsers.set(this.filterUsers(_users));
    }

    onRemoveUser(id: number) {
        let _users = [...this.users()];
        _users = _users.filter((user) => user.id !== id);
        this.setUsers(_users);
        this.selectList(this.selectedList());
        this.clearUser();
    }

    filterUsers(users: User[]) {
        this.hasNextPage.set(this.PER_PAGE * this.currentPage() < users.length);
        this.hasPreviousPage.set(this.currentPage() > 1);
        this.lastPage.set(Math.ceil(users.length / this.PER_PAGE));
        return users.slice((this.currentPage() - 1) * this.PER_PAGE, this.PER_PAGE * this.currentPage());
    }


    private sortUsers(users: User[]) {
        return users.sort((a, b) => {
            const surnameComparison = a.surname.localeCompare(b.surname);
            if (surnameComparison !== 0) {
                return surnameComparison;
            }
            return a.name.localeCompare(b.name);
        });
    }
}