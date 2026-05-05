export async function joinRoom(connection: any, user: string, room: string) {
    try {
        return connection.invoke("JoinRoom", { user, room });
    } catch (error) {
        console.log('WAREHOUSE JOIN ROOM ERROR: ', error);
    }
}