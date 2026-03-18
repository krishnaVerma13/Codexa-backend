import z from "zod"

const baseUserSchema = z.object({
    name : z.string().min(3).max(50),
   role : z.enum(["developer" , "admin"]).default("developer"),
})

const emailRegistrationSchema = baseUserSchema.extend({
    authType : z.literal("email"),
    email : z.email(),
    password : z.string().min(6).max(100)

})

const githubRegistrationSchema = baseUserSchema.extend({
    authType : z.literal("github"),
    githubId : z.string(),
    githubUsername : z.string(),
    githubAccessToken : z.string(),
    email : z.email().optional()
})

export const registerSchema = z.discriminatedUnion("authType" , [
    emailRegistrationSchema,
    githubRegistrationSchema
]);

export type RegisterSchemaType = z.infer<typeof registerSchema>
export type EmailRegistrationSchemaType = z.infer<typeof emailRegistrationSchema>
export type GithubRegistrationSchemaType = z.infer<typeof githubRegistrationSchema>


export const userLoginSchema = z.object({
    email : z.email(),
    password : z.string().min(6)
})

export type UserLoginSchemaType = z.infer<typeof userLoginSchema>