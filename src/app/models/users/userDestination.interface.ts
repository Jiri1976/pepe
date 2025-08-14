import { UserPosition } from "./userPosition.interface";

export interface UserDestination {
    id: number,
    userId: number,
    destination: 'F-M' | 'OVA',
    positions?: UserPosition[]
}