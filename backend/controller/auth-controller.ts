import type { Request, Response, NextFunction, Errback } from 'express'
import User from "../model/user.js"
import bcrypt from "bcrypt"
import jwt from"jsonwebtoken"
import Verification from '../model/verification.js';
import { sendEmail } from '../libs/send-email.js';
import aj from '../libs/arcjet.js';
import { isSpoofedBot } from "@arcjet/inspect";


interface VerificationTokenPayload extends jwt.JwtPayload {
  userId: string;
  purpose: string;
}


const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
}

const registerUser = async (req:Request, res:Response) => {
try{
    const {email, name, password, confirmPassword} = req.body;


    const decision = await aj.protect(req, {
      email,
      requested: 1,
    });
    
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          message: "Too Many Requests",
        });
      }
    
      if (decision.reason.isBot()) {
        return res.status(403).json({
          message: "No bots allowed",
        });
      }
    
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    
    if (decision.ip.isHosting()) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    
    if (decision.results.some(isSpoofedBot)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const existingUser = await User.findOne({email});

    if(existingUser){
        return res.status(400).json({message: "Email already in use"})
    }

    if(password !== confirmPassword){
        return res.status(400).json({message: "Passwords dont match"})
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        email,
        password: hashedPassword,
        name
    })

    const verificationToken = jwt.sign(
        {userId: newUser._id, purpose: "email-verification"},
        JWT_SECRET,
        {expiresIn: "1d"}
    );

    await Verification.create({
        userId: newUser._id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
        })

    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
    const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
    const sendSubject = "Verify your email";
    const isEmailSent = await sendEmail(email, sendSubject, emailBody)
    if(!isEmailSent) {
        return res.status(500).json({
            message: "Failed to send verification email"
        })
    }
    res.status(200).json({message: "Verification email sent, please verify account"})

}catch (error) {
    res.status(500).json({message: "Internal server error", error})
}

}







const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // User hasn't verified their email
    if (!user.isEmailVerified) {
      const existingVerification = await Verification.findOne({
        userId: user._id,
      });

      // Existing verification token is still valid
      if (
        existingVerification &&
        existingVerification.expiresAt > new Date()
      ) {
        return res.status(400).json({
          message:
            "Email not verified. Please check your email for the verification link.",
        });
      }

      // Delete expired verification if one exists
      if (existingVerification) {
        await Verification.findByIdAndDelete(existingVerification._id);
      }

      // Create a new verification token
      const verificationToken = jwt.sign(
        {
          userId: user._id,
          purpose: "email-verification",
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      await Verification.create({
        userId: user._id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      });

      // Send verification email
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      const emailBody = `
        <p>
          Click <a href="${verificationLink}">here</a>
          to verify your email.
        </p>
      `;

      const emailSubject = "Verify your email";

      const isEmailSent = await sendEmail(
        email,
        emailSubject,
        emailBody
      );

      if (!isEmailSent) {
        return res.status(500).json({
          message: "Failed to send verification email",
        });
      }

      return res.status(403).json({
        message:
          "Verification email sent to your email. Please check your email and verify your account.",
      });
    }

    // Create login JWT
    const token = jwt.sign(
      {
        userId: user._id,
        purpose: "login",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.lastLogin = new Date();
    await user.save();

    const { password: _, ...userData } = user.toObject();
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });


    return res.status(200).json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};








const verifyEmail = async (req:Request, res:Response) => {
  try{

    const {token} = req.body;

    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
    
    const payload = decoded as VerificationTokenPayload;
    
    const { userId, purpose } = payload;

    if(purpose !=="email-verification"){
      return res.status(401).json({message: "Unauthorized"})
    }

    const verification = await Verification.findOne({
      userId,
      token
    })

    if(!verification){
      return res.status(401).json({message: "Unauthorized"})
    }

    const isTokenExpired = verification.expiresAt < new Date();

    if(isTokenExpired){
      return res.status(401).json({message: "Token Expired"})
    }

  const user = await User.findById(userId)

  if(!user){
    return res.status(401).json({message: "Unauthorized"})
  }

  if(user.isEmailVerified){
    return res.status(400).json({message: "User already verified"})
  }


  user.isEmailVerified = true;
  await user.save();

  await Verification.findByIdAndDelete(verification._id);


  res.status(200).json({message: "Email verified successfully"})

  }catch (error) {
      res.status(500).json({message: "Internal server error", error})
  }
  
}






const authMe = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    if (typeof payload === "string") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    if (payload.purpose !== "login") {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("Auth check failed:", error);

    return res.status(401).json({
      authenticated: false,
      message: "Invalid or expired token",
    });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
};



const resetPasswordRequest = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    const existingVerification = await Verification.findOne({
      userId: user._id,
    });

    if (existingVerification && existingVerification.expiresAt > new Date()) {
      return res.status(400).json({
        message: "Reset password request already sent",
      });
    }

    if (existingVerification && existingVerification.expiresAt < new Date()) {
      await Verification.findByIdAndDelete(existingVerification._id);
    }

    const resetPasswordToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    await Verification.create({
      userId: user._id,
      token: resetPasswordToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetPasswordLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetPasswordToken}`;
    const emailBody = `<p>Click <a href="${resetPasswordLink}">here</a> to reset your password</p>`;
    const emailSubject = "Reset your password";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res.status(500).json({
        message: "Failed to send reset password email",
      });
    }

    res.cookie("token", resetPasswordToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



const verifyResetPasswordTokenAndResetPassword = async (req: Request, res: Response) => {
  try {
    const {newPassword, confirmPassword } = req.body;

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Reset token missing",
      });
    }

    const payload = jwt.verify(token,JWT_SECRET);

    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (typeof payload === "string") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    if (payload.purpose !== "reset-password") {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }
    const { userId, purpose } = payload;


    const verification = await Verification.findOne({
      userId,
      token,
    });

    if (!verification) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isTokenExpired = verification.expiresAt < new Date();

    if (isTokenExpired) {
      return res.status(401).json({ message: "Token expired" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashPassword;
    await user.save();

    await Verification.findByIdAndDelete(verification._id);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {registerUser, loginUser, verifyEmail, authMe, logoutUser, resetPasswordRequest, verifyResetPasswordTokenAndResetPassword}