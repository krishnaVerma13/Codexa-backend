export class ApiResponce<T>{
    statusCode: number;
    success: boolean;
    message: string;
    data: T | null;

    constructor(statusCode: number, message: string, data: T | null) {
        this.statusCode = statusCode;
        this.success = statusCode >= 200 ;
        this.message = message;
        this.data = data;
    }
}