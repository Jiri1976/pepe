import { GetUserDTO } from "../users/getUserDTO.interface";

export interface GetUserShiftCard {
    monthYear: string,
    user: GetUserDTO
}