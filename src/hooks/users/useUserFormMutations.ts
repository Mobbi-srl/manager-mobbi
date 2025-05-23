
import { useCreateUser } from "./useCreateUser";
import { useUpdateUser } from "./useUpdateUser";

export const useUserFormMutations = (onClose: () => void) => {
  const createMutation = useCreateUser(onClose);
  const updateMutation = useUpdateUser(onClose);

  return { createMutation, updateMutation };
};
