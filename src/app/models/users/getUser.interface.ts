export interface GetUser {
    id: number,
    name: string,
    surname: string,
    password?: string,
    email: string,
    role: string,
    position: 'Cook' | 'Driver' | '',
    destination: 'F-M' | 'OVA' | '',
    nick: string,
    isActive: boolean
}