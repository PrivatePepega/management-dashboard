import { fetchData, postData } from "@/lib/fetch-util";
import type { SignupFormData } from "@/app/auth/sign-up/page";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "@/types";

export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (data: SignupFormData) => postData("/auth/register", data),
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: (data: { token: string }) =>
      postData("/auth/verify-email", data),
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      postData("/auth/login", data),
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      postData("/auth/reset-password-request", data),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    }) => postData("/auth/reset-password", data),
  });
};

export const useAuthMeMutation = () => {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: () => fetchData<{ authenticated: boolean; user: User }>("/auth/me"),
  });
};


export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => postData("/auth/logout", {}),
  });
};