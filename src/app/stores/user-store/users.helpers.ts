import { User } from "../../models/users.interface";

export function selectUsers(users: User[], filter: 'All' | 'F-M' | 'OVA', role: 'User' | 'Master' | 'Admin' | ''): User[] {
    if (filter !== 'All') {
        users = users.filter(u => (u.destinations[0].destination === filter && u.destinations[0]?.positions?.length! > 0 && u.role === role) || (u.destinations[1].destination === filter && u.destinations[1]?.positions?.length! > 0 && u.role === role));
    } else {
        users = role !== '' ? users.filter(u => u.role === role) : users;
    }
    return users;
}

export function getFakeArray(filteredUsers: User[]): any[] {
    let fakeArray = [];
    for (let i = 0; i < 10 - filteredUsers.length; i++) {
        fakeArray.push(i);
    }
    return fakeArray;
}

export function onSortUsers(users: User[]) {
    return users.sort((a, b) => {
        const surnameComparison = a.surname.localeCompare(b.surname);
        if (surnameComparison !== 0) {
            return surnameComparison;
        }
        return a.name.localeCompare(b.name);
    });
}

export function onRemoveUser(id: number, users: User[]) {
    return users.filter((user) => user.id !== id);
}

export function onUpdateUser(updatedUser: User, users: User[]) {
    return users.map(user => {
        if (user.id === updatedUser.id) {
            return {
                ...user,
                name: updatedUser.name,
                surname: updatedUser.surname,
                email: updatedUser.email,
                password: '',
                role: updatedUser.role,
                destinations: updatedUser.destinations,
                isActive: updatedUser.isActive,
                image: updatedUser.image,
                imageName: updatedUser.imageName
            };
        } else {
            return user;
        }
    });
}