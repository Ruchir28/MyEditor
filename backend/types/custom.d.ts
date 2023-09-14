import { Request } from 'express';
import { UserType } from '@ruchir28/common';

export interface User {
    id: number;
    email: string;
}

declare module 'express' {
    interface Request {
        user?: User;  
    }
}
