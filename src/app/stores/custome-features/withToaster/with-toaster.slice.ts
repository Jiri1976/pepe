export interface ToasterSlice {
    readonly notifications: string[];
}

export const initialToasterSlice: ToasterSlice = {
    notifications: []
}