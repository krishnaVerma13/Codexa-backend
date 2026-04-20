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
            // console.log(token);
            
            return jwt.verify(token, SecrateKey) as JwtPayload;
        } catch (err : any) {
            console.log("token error :",err);
            
            if (err.name === "TokenExpiredError") {
                throw new Error("Token expired");
            } else if (err.name === "JsonWebTokenError") {
                throw new Error("Invalid token format");
            } else {
                throw new Error("Invalid or expired token");
            }
        }
    },

    // async ReFreshToken(token: string): Promise<{ token: string; payload: JwtPayload }> {
    //     try {
    //   // Verify the old token first
    //   const oldPayload = await this.verifyToken(token);
    //   const newToken = await this.generateToken(oldPayload);

    //   return {
    //     token: newToken,
    //     payload: oldPayload,
    //   };
    // } catch (err: any) {
    //   // Re-throw or wrap the error with a clear message
    //   if (err.message === "Token expired") {
    //     throw new Error("Refresh failed: original token already expired");
    //   } else if (err.message === "Invalid token format") {
    //     throw new Error("Refresh failed: invalid refresh token format");
    //   } else {
    //     throw new Error(`Refresh failed: ${err.message}`);
    //   }
    // }
    // }

}