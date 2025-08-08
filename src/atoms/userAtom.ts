import { atom } from "jotai";

export type User = {
  userId: string;
  userName: string;
  groupId: string;
};

export const userAtom = atom<User | null>(null);
