import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { User } from "../models/users.interface";

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private http = inject(HttpClient);
    private BASE_ROUTE = environment.AUTHENTICATION_PATH;

    getUsers(isAdmin: boolean, destination?: string) {
        let url = '';
        if (isAdmin) {
            url = this.BASE_ROUTE + 'GetAllUsers';
        } else {
            url = this.BASE_ROUTE + `GetListOfUsers?destination=${destination}`;
        }
        return this.http.get<Response>(url);
    }

    getProposalUsers(destination: string) {
        let url = this.BASE_ROUTE + `GetListOfUsers?destination=${destination}`;
        return this.http.get<Response>(url);
    }

    createUser(user: User) {
        const data = this.createFormData(user);
        const url = this.BASE_ROUTE + 'Register';
        return this.http.post<Response>(url, data);
    }

    getUser(userId: number) {
        const url = this.BASE_ROUTE + `GetUser/${userId}`;
        return this.http.get<Response>(url);
    }

    updateUser(user: User) {
        const data = this.createFormData(user);
        const url = this.BASE_ROUTE + `Update`;
        return this.http.post<Response>(url, data);
    }

    deleteUser(userId: number) {
        const url = this.BASE_ROUTE + `delete/${userId}`;
        return this.http.delete<Response>(url);
    }

    private createFormData(user: User) {
        const formData = new FormData();
        formData.append('id', user.id.toString());
        formData.append('name', user.name);
        formData.append('surname', user.surname);
        formData.append('email', user.email);
        formData.append('password', user.password ? user.password : '');
        formData.append('role', user.role);
        formData.append('destinations', JSON.stringify(user.destinations));
        formData.append('nick', user.nick);
        formData.append('isActive', user.isActive.toString());
        if (user.imageFile) { formData.append('imageFile', user.imageFile); }
        formData.append('imageName', user.imageName ? user.imageName : '');
        formData.append('image', user.image ? user.image : '');
        return formData;
    }
}