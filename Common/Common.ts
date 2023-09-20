
export interface BaseResponse {
    status: RequestStatus;
    message?: string;
}


export interface UploadChunkResponse extends BaseResponse {
    chunkId: string;
    uploadStatus: boolean;
    message?: string;
}

export enum UserType {
    OWNER = "OWNER",
    EDITOR = "EDITOR"
}

export enum RequestStatus {
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE"
}

export enum AssignmentStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    REVIEW = "REVIEW",
    DONE = "DONE",
    CANCELLED = "CANCELLED"
}

export interface RegisterUserRequest {
    email: string;
    password: string;
    username: string;
    userType: UserType;
}

export interface RegisterUserResponse extends BaseResponse {
    userId?: number;
}

export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface LoginUserResponse extends BaseResponse{
    userId?: number;
    jwtToken?: string;
}

export interface CreateAssignmentRequest {
    title: string;
    reporterId: number;
    assigneeId?: number;
}

export interface CreateAssignmentResponse extends BaseResponse {
    assignmentId?: number;
}

export interface UpdateAssignmentRequest {
    assignmentId: number;
    title: string;
    reporterId: number;
    status?: AssignmentStatus;
}

export interface UpdateAssignmentResponse extends BaseResponse {}

export interface AddVideoVersionToAssignmentRequest {
    assignmentId: number;
    videoId: number;
}

export interface AddVideoVersionToAssignmentResponse extends BaseResponse{}

export interface UpdateVideoVersionRequest {
    videoId: number;
}

export interface UpdateVideoVersionResponse extends BaseResponse{}

export interface AddCommentToVideoVersion {
    videoVersionId: number;
    comment: string;
}