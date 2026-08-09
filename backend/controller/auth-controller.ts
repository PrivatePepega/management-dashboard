import type { Request, Response, NextFunction, Errback } from 'express'
import User from "../model/user.js"
import bcrypt from "bcrypt"

const registerUser = async (req:Request, res:Response) => {

try{
    const {email, name, password} = req.body;

    const existingUser = await User.findOne({email});

    if(existingUser){
        return res.status(400).json({message: "Email already in use"})
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        email,
        password: hashedPassword,
        name
    })

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