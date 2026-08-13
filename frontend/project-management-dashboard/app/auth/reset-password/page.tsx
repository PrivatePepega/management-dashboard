"use client";


import { Input } from "@/components/ui/input";
import { resetPasswordSchema } from "@/types/zodSchemas";
import { z } from "zod";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useResetPasswordMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";



type FormState = {
  errors?: {
    newPassword?: string[];
    confirmPassword?: string[];
  };
};






const resetPassword = () => {

  const initialState: FormState = {};
  const [state, formAction] = useActionState(resetPassword,initialState);
  const router = useRouter();

  const {mutate, isPending} = useResetPasswordMutation()



  async function resetPassword(
    previousState: FormState,
    formData: FormData
  ): Promise<FormState> {
    const data = {
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    };
  
    const result = resetPasswordSchema.safeParse(data);
  
    if (!result.success) {
      const errors = z.treeifyError(result.error);
  
      return {
        errors: {
          newPassword: errors.properties?.newPassword?.errors,
          confirmPassword: errors.properties?.confirmPassword?.errors,
        },
      };
    }
  
    mutate(result.data, {
      onSuccess: () => {
        toast.success("Password reset successfull", {
          description: "Sending to sign in page"
        });
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 3000);      
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
        <h3 className="text-center mb-4">Rest Password</h3>
        <form action={formAction} className="flex flex-col gap-3">
          <Input name="newPassword" type="password" placeholder="New Password"/>

          {state.errors?.newPassword && (
            <p>{state.errors.newPassword[0]}</p>
          )}

          <Input name="confirmPassword" type="password" placeholder="Confirm Password"/>

          {state.errors?.confirmPassword && (
            <p>{state.errors.confirmPassword[0]}</p>
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


export default resetPassword
