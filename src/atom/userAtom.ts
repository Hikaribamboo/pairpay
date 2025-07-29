import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { User } from "@/types/user";

const storage = createJSONStorage<User | undefined>(() => sessionStorage);

export const userAtom = atomWithStorage<User | undefined>("user", undefined, storage);
