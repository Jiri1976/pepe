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
    private http = inject(HttpClient);
    private BASE_ROUTE = environment.AUTHENTICATION_PATH;
    private initialUser: GetUserDTO = { id: 0, name: '', surname: '', email: '', role: '', position: '', destination: '', nick: '', isActive: true };
    users = signal<GetUserDTO[]>([]);
    user = signal<GetUserDTO>(this.initialUser);

    clearUser() {
        this.user.set(this.initialUser);
    }

    resetUser() {
        this.user.set({ id: -1, name: '', surname: '', email: '', role: '', position: '', destination: '', nick: '', isActive: true })
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

    removeUser(userId: number) {
        let users = [...this.users()];
        let filteredUsers = users.filter(u => u.id !== userId);
        this.setUsers(filteredUsers);
    }

    storedUsers() {
        return this.users();
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
        console.log('here');

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
}