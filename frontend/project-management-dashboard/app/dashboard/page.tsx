"use client"

import { Button } from '@/components/ui/button';
import { useLogoutMutation } from '@/hooks/use-auth';
import React from 'react'
import { toast } from 'sonner';

const page = () => {


  const {mutate, isPending} = useLogoutMutation()


  function logout() {
    mutate(undefined, {
      onSuccess: () => {
        toast.success("Logout successful");
      },

      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";

        console.log("Error message:", errorMessage);
        toast.error(errorMessage);
      },
    });
  }


  return (
    <div>
      page
      <Button onClick={logout}>logout</Button>
    </div>
  )
}

export default page