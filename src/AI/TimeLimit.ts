import mongoose from "mongoose";
import { userRepo } from "../repository/user.repo.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import type { TUser } from "../Types.js";
import User from "../modules/UserModal.js";

export const TimeLimit = {
    
    async setTokenResetTime(userId : mongoose.Types.ObjectId) : Promise<ApiResponce<TUser> | ApiError> {
        console.log("call TimeLine SetResetTime");
        
        const now = new Date();
        const resetAt = new Date(now);
        resetAt.setHours(0, 15, 0, 0); // 12:15 AM

        // If 12:15 AM already passed today → target tomorrow
        if (now >= resetAt) {
            resetAt.setDate(resetAt.getDate() + 1);
        }

        const resetIn = resetAt.getTime() - now.getTime();
        const resp = await userRepo.updateUser({
            filter : {_id : userId},
            update : {resetLimiteAt : resetAt , isLimitRichied : true}
        })
        if(resp.success == true){
            return new ApiResponce(422 , "Reset time limite set", resp.data);
        }
        return new ApiError(400 , resp.message ) 
    },

    async resetTokenLimit(userId: mongoose.Types.ObjectId): Promise<ApiResponce<TUser> | ApiError> {
    console.log("call TokenReset resetTokenLimit");

    const resp = await userRepo.updateUser({
      filter: { _id: userId },
      update: {
        tokenUsed: 0,
        isLimitRichied: false,
        resetLimiteAt: null,
      }
    });

    if (resp.success === true) {
      return new ApiResponce(200, "Token limit reset successfully", resp.data);
    }
    return new ApiError(400, resp.message);
  },

  
  // Call once on server start — auto-fires when resetLimiteAt is reached
  async scheduleResetForUser(userId: mongoose.Types.ObjectId, resetAt: Date): Promise<void> {
    const delay = resetAt.getTime() - Date.now();
    if (delay <= 0) {
      // Already past — reset immediately
      await this.resetTokenLimit(userId);
      return;
    }

    setTimeout(async () => {
      await this.resetTokenLimit(userId);
    }, delay);
  }


}

// On server start — reschedule for all users still in limited state
export async function recoverPendingResets(): Promise<void> {
  const limitedUsers = await User.find({
    isLimitRichied: true,
    resetLimiteAt: { $ne: null }
  }).select("_id resetLimiteAt");
// console.log("limited user :",limitedUsers);

  for (const user of limitedUsers) {
    await TimeLimit.scheduleResetForUser(new mongoose.Types.ObjectId(user._id), new Date(user?.resetLimiteAt!));
  }

  console.log(`[TokenReset] Recovered ${limitedUsers.length} pending resets`);
}