export interface UserVm {
    readonly id: number;
    readonly name: string;
    readonly surname: string;
    readonly email: string;
    readonly password: string;
    readonly role: 'User' | 'Master' | 'Admin';
    readonly destinations: [],
    readonly nick: string;
    readonly isActive: boolean;
    readonly image: string | null;
}