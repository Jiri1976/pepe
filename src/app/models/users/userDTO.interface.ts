export interface UserDTO {
    id: number,
    name: string,
    surname: string,
    email: string,
    password: string,
    role: string,
    position: 'Cook' | 'Driver',
    destination: 'F-M' | 'OVA',
    nick: string,
    isActive: boolean
}