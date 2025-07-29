import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { Observable } from "rxjs";
import { GetUserDTO } from "../models/users/getUserDTO.interface";
import { UserDTO } from "../models/users/userDTO.interface";

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private PER_PAGE = 10;
    private http = inject(HttpClient);
    private BASE_ROUTE = environment.AUTHENTICATION_PATH;
    private initialUser: GetUserDTO = { id: 0, name: '', surname: '', email: '', role: 'User', position: 'Cook', destination: 'F-M', nick: '', isActive: true };
    users = signal<GetUserDTO[]>([]);
    user = signal<GetUserDTO>(this.initialUser);
    selectedList = signal<number>(6);
    filteredUsers = signal<GetUserDTO[]>([]);
    currentPage = signal<number>(1);
    filter = signal<'All' | 'F-M' | 'OVA'>('All');
    role = signal<'User' | 'Master' | 'Admin'>('User');

    hasNextPage = signal<boolean>(false);
    hasPreviousPage = signal<boolean>(false);
    lastPage = signal<number>(1);

    clearUser() {
        this.user.set(this.initialUser);
    }

    setUser(user: GetUserDTO) {
        this.user.set(user);
    }

    setUsers(users: GetUserDTO[]) {
        this.users.set(users);
    }

    addUser(user: GetUserDTO) {
        let _users = [...this.users()];
        _users.push(user);
        this.users.set(_users);
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
            let _users = this.users().filter(i => this.role() === 'Admin' ? i.role === this.role() : i.destination === this.filter() && i.role === this.role());
            this.filteredUsers.set(this.filterUsers(_users));
        } else if (value === 2) {
            this.filter.set('OVA');
            let _users = this.users().filter(i => this.role() === 'Admin' ? i.role === this.role() : i.destination === this.filter() && i.role === this.role());
            this.filteredUsers.set(this.filterUsers(_users));
        } else if (value === 3) {
            this.role.set('User');
            let _users = this.users().filter(i => this.filter() === 'All' ? i.role === this.role() : i.destination === this.filter() && i.role === this.role());
            this.filteredUsers.set(this.filterUsers(_users));
        } else if (value === 4) {
            this.role.set('Master');
            let _users = this.users().filter(i => this.filter() === 'All' ? i.role === this.role() : i.destination === this.filter() && i.role === this.role());
            this.filteredUsers.set(this.filterUsers(_users));
        } else if (value === 5) {
            this.role.set('Admin');
            let _users = this.users().filter(i => i.role === this.role());
            this.filteredUsers.set(this.filterUsers(_users));
        } else if (value === 6) {
            this.filter.set('All');
            let _users = [...this.users()];
            this.filteredUsers.set(this.filterUsers(_users));
        }
    }

    updateAllAfterUpdate(updatedUser: GetUserDTO) {
        let users = [...this.users()];
        users.forEach((user) => {
            if (user.id === updatedUser.id) {
                user.name = updatedUser.name,
                    user.surname = updatedUser.surname,
                    user.email = updatedUser.email,
                    user.role = updatedUser.role,
                    user.position = updatedUser.position,
                    user.destination = updatedUser.destination,
                    user.nick = updatedUser.nick,
                    user.isActive = updatedUser.isActive
            }
        });
        this.setUsers(users);
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

    createUser(_user: UserDTO) {
        const url = this.BASE_ROUTE + `authentication/Register`;
        return this.http.post<Response>(url, _user);
    }

    updateUser(user: GetUserDTO) {
        const url = this.BASE_ROUTE + `authentication/Update`;
        return this.http.post<Response>(url, user);
    }

    deleteUser(userId: number) {
        const url = this.BASE_ROUTE + `authentication/delete/${userId}`;
        return this.http.delete<Response>(url);
    }

    changePassword(data: { oldPassword: string, newPassword: string }): Observable<Response> {
        const url = this.BASE_ROUTE + `authentication/ChangePassword`;
        const resetPasswordData = { id: this.user().id, oldPassword: data.oldPassword, newPassword: data.newPassword };
        return this.http.post<Response>(url, resetPasswordData);
    }

    filterUsers(users: GetUserDTO[]) {
        this.hasNextPage.set(this.PER_PAGE * this.currentPage() < users.length);
        this.hasPreviousPage.set(this.currentPage() > 1);
        this.lastPage.set(Math.ceil(users.length / this.PER_PAGE));
        return users.slice((this.currentPage() - 1) * this.PER_PAGE, this.PER_PAGE * this.currentPage());
    }

    onCreate(user: GetUserDTO) {
        let _users = [...this.users()];
        _users = this.sortUsers(_users);
        this.setUsers(_users);
        this.filteredUsers.set(this.filterUsers(_users));
        this.selectList(this.selectedList());
    }

    onUpdateUser(_user: GetUserDTO) {
        let _users = [...this.users()];
        _users = _users.map(user => {
            if (user.id === _user.id) {
                return { ...user, name: _user.name, surname: _user.surname, email: _user.email, role: _user.role, destination: _user.destination, position: _user.position, isActive: _user.isActive };
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

    private sortUsers(users: GetUserDTO[]) {
        return users.sort((a, b) => {
            const surnameComparison = a.surname.localeCompare(b.surname);
            if (surnameComparison !== 0) {
                return surnameComparison;
            }
            return a.name.localeCompare(b.name);
        });
    }

}