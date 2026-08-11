"use client";


import { Input } from "@/components/ui/input";
import { signUpSchema } from "@/types/zodSchemas";
import { z } from "zod";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSignUpMutation } from "@/hooks/use-auth";
import { toast } from "sonner";



type FormState = {
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
    confirmPassword?: string[];
  };
};



export type SignupFormData = z.infer<typeof signUpSchema>;

const signup = () => {

  const initialState: FormState = {};
  const [state, formAction] = useActionState(createUser,initialState);


  const {mutate, isPending} = useSignUpMutation()



  async function createUser(
    previousState: FormState,
    formData: FormData
  ): Promise<FormState> {
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      confirmPassword: formData.get("confirmPassword")
    };
    console.log(data);

    const zodResult = signUpSchema.safeParse(data);
  
    if (!zodResult.success) {
      const errors = z.treeifyError(zodResult.error);

      return {
        errors: {
          email: errors.properties?.email?.errors,
          password: errors.properties?.password?.errors,
          name: errors.properties?.name?.errors,
          confirmPassword: errors.properties?.confirmPassword?.errors,

        },
      };
    }
  
    mutate(zodResult.data, {
      onSuccess: () => {
        toast.success("Account created succesfully");
      },
      onError: (error:any) =>{
        const errorMessage = error.response?.data?.message || "An error occured";
        console.log("Error message:", errorMessage);
        toast.error(errorMessage);
      }
    });

    return {};
  }






  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-6 flex-col justify-center items-center">
        <h3 className="text-center mb-4">Sign Up</h3>
        <form action={formAction} className="flex flex-col gap-3">
          <Input name="name" type="text" placeholder="Full Name"/>
          {state.errors?.name && (
            <p>{state.errors.name[0]}</p>
          )}


          <Input name="email" type="email" placeholder="E-mail"/>
          {state.errors?.email && (
            <p>{state.errors.email[0]}</p>
          )}

          <Input name="password" type="password" placeholder="Password"/>
          {state.errors?.password && (
            <p>{state.errors.password[0]}</p>
          )}

          <Input name="confirmPassword" type="password" placeholder="Confirm Password"/>
          {state.errors?.confirmPassword && (
            <p>{state.errors.confirmPassword[0]}</p>
          )}

          <Button type="submit" disabled={isPending}>Create Account</Button>
        </form>
      </div>
      <div className="flex flex-col items-center">
        <h3>Already have an account?</h3>
        <Button><Link href='/auth/sign-in'>Log in</Link></Button>
      </div>
    </div>
  )
}

export default signup