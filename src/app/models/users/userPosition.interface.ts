export interface UserPosition {
    id: number,
    userDestinationId: number,
    position: 'Driver' | 'Cook' | null
}