import { atom } from "recoil";

export const userIdState = atom({
    key: "userId",
    default: null,
})

export const userNameState = atom({
    key:"userName",
    default: null,
})

export const GoalState = atom({
    key:"goal",
    default : [],
})