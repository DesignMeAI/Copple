import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
    key: "sessionStorage", // 고유한 key 값
    storage: sessionStorage,
})

export const infoState = atom({
    key: "infoState",
    default: "",
    effects_UNSTABLE: [persistAtom]
})

export const goalState = atom({
    key: "goal",
    default: [],
})
export const savedGoalsState = atom({
    key: 'savedGoalsState',
    default: [], // 기본값은 빈 배열
});


export const modeState = atom({
    key: "mode",
    default: "create"
})

export const goalIdState = atom({
    key: "goalId",
    default: ""
})
