import jwt from "jsonwebtoken"


const SecrateKey = process.env.SECRET_KEY || 'hello hay ';

interface JwtPayload {
    userId: string;
}

export const JwtToken = {

    async generateToken(payload: JwtPayload): Promise<string> {
        return jwt.sign(payload, SecrateKey, { expiresIn: '7d' });
    },

    async verifyToken(token: string): Promise<JwtPayload> {
        try {
            return jwt.verify(token, SecrateKey) as JwtPayload;
        } catch (err) {
            throw new Error('Invalid or expired token');
        }
    },
}