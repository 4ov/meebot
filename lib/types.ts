import { Context, SessionFlavor } from "npm:grammy";

export type SessionData = {
    lastContextType: "translate" | "mute" | "none";
    count: number
};

export type FullContext = Context & SessionFlavor<SessionData>;



export function getInitialSession(): SessionData{
    return {
        lastContextType: "none",
        count: 0
    }
}