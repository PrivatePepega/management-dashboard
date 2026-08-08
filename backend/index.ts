import "dotenv/config";
import express, { request } from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import type { Request, Response, NextFunction, Errback } from 'express'




const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", async (req:Request, res:Response) => {
    res.status(200).json({message: "server hit"})
})


app.use((err: Errback, req:Request, res:Response, next:NextFunction) => {
    res.status(404).json({message: "Not Found"})
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});