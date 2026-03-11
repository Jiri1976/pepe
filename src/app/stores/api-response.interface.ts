export interface ApiResponse<T> {
    isSuccess: boolean;
    errorMessage?: string;
    result: T;
}