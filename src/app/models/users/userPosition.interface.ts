export interface UserPosition {
    id: number,
    userDestinationId: number,
    position: 'Driver' | 'Cook' | 'Helper' | 'Pizza' | null
}