/**
 Atlas format for pixi
 */
import { IPixiSpritesheetFrameData } from "./IPixiSpritesheetFrameData";

export interface IPixiSpritesheetData {
    frames: Record<string, IPixiSpritesheetFrameData>;
    // animations?: Dict<string[]>;
    meta: {
        app?: string,
        version?: string;
        image: string;
        format?: "RGBA8888";
        size: { "w": number, "h": number };
        scale: string;
    };
}
