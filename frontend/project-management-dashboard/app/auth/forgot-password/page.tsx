"use client";


import { Input } from "@/components/ui/input";
import { forgotPasswordSchema } from "@/types/zodSchemas";
import { z } from "zod";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useForgotPasswordMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";



type FormState = {
  errors?: {
    email?: string[];
  };
};






const forgotPassword = () => {

  const initialState: FormState = {};
  const [state, formAction] = useActionState(forgotPassword,initialState);
  const router = useRouter();

  const {mutate, isPending} = useForgotPasswordMutation()



  async function forgotPassword(
    previousState: FormState,
    formData: FormData
  ): Promise<FormState> {
    const data = {
      email: formData.get("email"),
    };
  
    const result = forgotPasswordSchema.safeParse(data);
  
    if (!result.success) {
      const errors = z.treeifyError(result.error);
  
      return {
        errors: {
          email: errors.properties?.email?.errors,
        },
      };
    }
  
    mutate(result.data, {
      onSuccess: () => {
        toast.success("Password Reset Email sent", {
          description: "Check Email"
        });
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
        <h3 className="text-center mb-4">Forgot Password</h3>
        <form action={formAction} className="flex flex-col gap-3">
          <Input name="email" type="email" placeholder="Email"/>

          {state.errors?.email && (
            <p>{state.errors.email[0]}</p>
          )}


          <Button type="submit">
            {isPending ? <Loader2 className="w-4 h-4 mr-2"/> : "Reset Password"}
          </Button>
        </form>
      </div>
      <div className="flex flex-col items-center">
        <h3>Don't have an account?</h3>
        <Button><Link href='/auth/sign-up'>Sign up</Link></Button>
      </div>
    </div>
  )
}


export default forgotPassword
