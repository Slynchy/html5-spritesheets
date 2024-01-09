/**
 * Atlas format for PlayCanvas
 */
export interface IPlayCanvasSpritesheetData {
    minfilter: string;
    magfilter: string;
    frames: Record<string, {
        rect: Array<number>;
        pivot: Array<number>;
        border?: Array<number>; // for nineslicing
    }>;
}