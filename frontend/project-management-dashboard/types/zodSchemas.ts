import { Password } from "@hugeicons/core-free-icons";
import { z } from "zod";

export const logInSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});


export const signUpSchema = z.object({
  name: z.string("Invalid Name").min(3, "Must be at least 3 characters long"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters")
})
.refine((data) => data.confirmPassword === data.password, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});