import type { Request, Response, NextFunction, Errback } from 'express'
import User from "../model/user.js"
import bcrypt from "bcrypt"
import jwt from"jsonwebtoken"
import Verification from '../model/verification.js';
import { sendEmail } from '../libs/send-email.js';
import aj from '../libs/arcjet.js';
import { isSpoofedBot } from "@arcjet/inspect";


const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
}

const registerUser = async (req:Request, res:Response) => {

try{
    const {email, name, password, confirmPassword} = req.body;


    const decision = await aj.protect(req, { email, requested: 5}); // Deduct 5 tokens from the bucket
    console.log("Arcjet decision", decision);
  
    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(403).json({
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
      } else if (decision.ip.isHosting()) {
      // Requests from hosting IPs are likely from bots, so they can usually be
      // blocked. However, consider your use case - if this is an API endpoint
      // then hosting IPs might be legitimate.
      // https://docs.arcjet.com/blueprints/vpn-proxy-detection
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
    } else if (decision.results.some(isSpoofedBot)) {
      // Paid Arcjet accounts include additional verification checks using IP data.
      // Verification isn't always possible, so we recommend checking the decision
      // separately.
      // https://docs.arcjet.com/bot-protection/reference#bot-verification
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Hello World" }));
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
        {userId: newUser._id, property: "email-verfication"},
        JWT_SECRET,
        {expiresIn: "1d"}
    )

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



const loginUser = async (req:Request, res:Response) => {

    try{

    }catch (error) {
        res.status(500).json({message: "Internal server error", error})
    }
    
}



export {registerUser, loginUser}