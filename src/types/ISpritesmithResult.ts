
export interface ISpritesmithResult {
    coordinates: { [key: string]: { x: number, y: number, width: number, height: number } };
    properties: { width: number, height: number };
    image: string;
}
