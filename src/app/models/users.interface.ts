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
    imageFile: File | undefined,
    imageName: string | undefined;
    image: string | null
}

export interface UserDestination {
    id: number,
    userId: number,
    destination: 'F-M' | 'OVA',
    positions?: UserPosition[]
}

export interface UserPosition {
    id: number,
    userDestinationId: number,
    position: 'Driver' | 'Cook' | 'Helper' | 'Pizza' | null
}

export const INITIAL_USER: User = {
    id: 0,
    name: '',
    surname: '',
    email: '',
    password: '',
    role: 'User',
    destinations: [{
        id: 0,
        userId: 0,
        destination: 'F-M',
        positions: []
    },
    {
        id: 0,
        userId: 0,
        destination: 'OVA',
        positions: []
    }],
    nick: '',
    isActive: true,
    imageFile: undefined,
    imageName: undefined,
    image: null
};
