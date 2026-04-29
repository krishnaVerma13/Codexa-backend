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
    userProfile: string;
    emailOTP?: Number;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateUserSchema{
        filter : object,
        update : object,
    }

export interface GetFilesSchema {
    full_name : string,
    sha? : string,
    type? : string
}


export interface GithubRepoResponce {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    language: string;
    created_at: string;
    updated_at: string;
}