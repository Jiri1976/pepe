import { UserDestination } from "./userDestination.interface";

export interface User {
    id: number,
    name: string,
    surname: string,
    email: string,
    password?: string,
    role: string,
    destinations: UserDestination[],
    nick: string,
    isActive: boolean,
    image: string | null
}