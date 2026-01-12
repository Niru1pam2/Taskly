import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData, postData, updateData, uploadData } from "~/lib/fetch-util";
import type {
  ChangePasswordFormData,
  ProfileFormData,
} from "~/routes/user/profile";

export const useUserProfileQuery = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => fetchData("/users/profile"),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      updateData("/users/change-password", data),
  });
};

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: (data: ProfileFormData) => updateData("/users/profile", data),
  });
};

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      return uploadData("/users/upload-profile-pic", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
  });
};

export const useDeleteAccountMutation = () => {
  return useMutation({
    mutationFn: async (userId: string) => postData("/users/delete-account", {}),
  });
};
