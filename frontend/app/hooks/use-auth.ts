import { useMutation } from "@tanstack/react-query";
import { postData } from "~/lib/fetch-util";
import type { SignUpFormData } from "~/routes/auth/sign-up";

export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (data: SignUpFormData) => postData("/auth/register", data),
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

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => postData("/auth/logout", {}),
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

export const useGenerateF2FASecretMutation = () => {
  return useMutation({
    mutationFn: () => postData("/auth//2fa/generate", {}),
  });
};

export const useVerifyF2FAMutation = () => {
  return useMutation({
    mutationFn: (data: { token: string; secret: string }) =>
      postData("/auth/2fa/verify", data),
  });
};

export const useDisableF2FAMutation = () => {
  return useMutation({
    mutationFn: () => postData("/auth/2fa/disable", {}),
  });
};

export const useLoginF2FAMutation = () => {
  return useMutation({
    mutationFn: (data: { userId: string; token: string }) =>
      postData("/auth/2fa/validate", data),
  });
};
