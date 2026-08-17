"use client";


import { Input } from "@/components/ui/input";
import { logInSchema } from "@/types/zodSchemas";
import { z } from "zod";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLoginMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";



type FormState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
};






const signin = () => {

  const initialState: FormState = {};
  const [state, formAction] = useActionState(signIn,initialState);
  const router = useRouter();

  const {mutate, isPending} = useLoginMutation()
  const queryClient = useQueryClient();



  async function signIn(
    previousState: FormState,
    formData: FormData
  ): Promise<FormState> {
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
  
    const result = logInSchema.safeParse(data);
  
    if (!result.success) {
      const errors = z.treeifyError(result.error);
  
      return {
        errors: {
          email: errors.properties?.email?.errors,
          password: errors.properties?.password?.errors,
        },
      };
    }
  
    mutate(result.data, {
      onSuccess: async () => {
        toast.success("Log in successfull", {
          description: "Sending to dashboard wait a few"
        });

        await queryClient.refetchQueries({
          queryKey: ["auth-me"],
        });
    
    
        router.push("/dashboard");

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
        <h3 className="text-center mb-4">Log In</h3>
        <form action={formAction} className="flex flex-col gap-3">
          <Input name="email" type="email" placeholder="E-mail"/>

          {state.errors?.email && (
            <p>{state.errors.email[0]}</p>
          )}

          <Input name="password" type="password" placeholder="Password"/>

          {state.errors?.password && (
            <p>{state.errors.password[0]}</p>
          )}
          <Link href="/auth/forgot-password" className="text-xs">Forgot password?</Link>

          <Button type="submit">
            {isPending ? <Loader2 className="w-4 h-4 mr-2"/> : "Login"}
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


export default signin
