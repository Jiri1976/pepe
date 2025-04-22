export interface AuthUser {
    name: string,
    email: string,
    role: string,
    destination: string,
    token: string,
    expiresIn: string
}