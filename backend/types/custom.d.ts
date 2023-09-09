import { Request } from 'express';
import { UserType } from '@ruchir28/common';

interface User {
    id: number;
    email: string;
    type: UserType;
}

declare module 'express' {
    interface Request {
        user?: User;  
    }
}
