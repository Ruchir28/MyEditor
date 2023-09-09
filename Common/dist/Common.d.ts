export interface UploadChunkResponse {
    chunkId: string;
    uploadStatus: boolean;
    message?: string;
}
export declare enum UserType {
    OWNER = "OWNER",
    EDITOR = "EDITOR"
}
export declare enum RequestStatus {
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE"
}
export interface RegisterUserRequest {
    email: string;
    password: string;
    username: string;
    userType: UserType;
}
export interface RegisterUserResponse {
    status: RequestStatus;
    message?: string;
    userId?: number;
}
export interface LoginUserRequest {
    email: string;
    password: string;
}
export interface LoginUserResponse {
    status: RequestStatus;
    message: string;
    userId?: number;
    jwtToken?: string;
}
