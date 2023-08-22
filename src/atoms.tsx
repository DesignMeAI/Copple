import { atom } from "recoil";

export interface IGoal {
    UserId: string;
    Title: string
    Period: number | string;
    Where:string;
    Content:string
}

export const goalState = atom<IGoal[]>({
    key: "goal",
    default: []
})