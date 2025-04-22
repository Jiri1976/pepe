export const ConvertToGetUserDTO = (object: any) => {
    const model = JSON.parse(JSON.stringify(object));
    return {
        id: model.id,
        name: model.name,
        surname: model.surname,
        email: model.email,
        role: model.role,
        position: model.position,
        destination: model.destination,
        nick: model.nick,
        isActive: model.isActive
    }
}

export const ConvertToUserDTO = (object: any) => {
    const model = JSON.parse(JSON.stringify(object));
    return {
        id: model.id,
        name: model.name,
        surname: model.surname,
        email: model.email,
        password: model.password,
        role: model.role,
        position: model.position,
        destination: model.destination,
        nick: model.nick,
        isActive: model.isActive
    }
}