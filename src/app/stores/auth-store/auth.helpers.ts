import { jwtDecode } from "jwt-decode";
import { AuthUser } from "../../models/auth-user.interface";

export function isTokenExpired(token: string | null): boolean {
    if (!token) {
        return false;
    }
    const decodedToken: any = jwtDecode(token!);
    let date = new Date(decodedToken.exp * 1000);
    const expirationTime = date.getTime() - new Date().getTime();
    return expirationTime <= 0;
}

export function getToken(): string | null {
    return localStorage.getItem('token');
};

export function setUserDetail(token: string): AuthUser | null {
    const decodedToken: any = jwtDecode(token!);
    let date = new Date(decodedToken.exp * 1000);
    const expirationTime = date.getTime() - new Date().getTime();
    if (expirationTime <= 0) {
        return null;
    }

    return ({
        name: decodedToken.name,
        email: decodedToken.email,
        role: decodedToken.role,
        destination: decodedToken.destination,
        token: token!,
        expiresIn: date.toString(),
        expireTime: expirationTime
    });
}

