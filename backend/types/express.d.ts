import type { User } from "../model/user.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};