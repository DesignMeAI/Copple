import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
    key: "sessionStorage", // 고유한 key 값
    storage: sessionStorage,
})

export const infoState = atom({
    key: "infoState",
    default: [],
    effects_UNSTABLE: [persistAtom]
})

export const goalState = atom({
    key: "goal",
    default: [],
})

