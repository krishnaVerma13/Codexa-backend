export interface TUser {
    _id: string,
    name: string;
    email?: string;
    password?: string;
    role: string;
    githubId?: string;
    githubUsername?: string;
    githubAccessToken?: string;
    isSubscribed: boolean;
    trialUsed: Number;
    trialLimit: Number;
    authType: string;
    emailOTP?: Number;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateUserSchema{
        filter : object,
        update : object,
    }