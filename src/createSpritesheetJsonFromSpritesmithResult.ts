import { ISpritesmithResult } from "./types/ISpritesmithResult";
import { IPixiSpritesheetData } from "./types/IPixiSpritesheetData";
import * as path from "path";
import { replaceSpaces } from "./replaceSpaces";
import { IPlayCanvasSpritesheetData } from "./types/IPlayCanvasSpritesheetData";

export function createSpritesheetJSON(
    _imageRelativeFilePath: string,
    _spritesmithData: ISpritesmithResult,
    _mode: "pixi" | "playcanvas"
): IPixiSpritesheetData | IPlayCanvasSpritesheetData {
    // @ts-ignore
    let res: IPixiSpritesheetData | IPlayCanvasSpritesheetData = {};

    if(_mode == "pixi") {
        res = {
            frames: {},
            meta: {
                image: replaceSpaces(path.basename(_imageRelativeFilePath)),
                scale: "1",
                size: {
                    w: _spritesmithData.properties.width,
                    h: _spritesmithData.properties.height,
                }
            }
        };
    } else if(_mode == "playcanvas") {
        res = {
            minfilter: "nearest",
            magfilter: "nearest",
            frames: {},
        } as IPlayCanvasSpritesheetData;
    }

    const _imageFileNameWithoutExt =
        replaceSpaces(_imageRelativeFilePath
            .substring(0, _imageRelativeFilePath.lastIndexOf("."))
            .replace(/\\/g, "/"));
    const fileNames = Object.keys(_spritesmithData.coordinates);
    fileNames.forEach((_e) => {
        const e = _e.replace(/\\/g, "/");
        let isDuplicate: boolean = false;
        if(
            e.search(/\.[0-9]\.png/) !== -1
        ) {
            isDuplicate = true;
        }
        let name;
        if(isDuplicate) {
            name = e.substring(
                (e.indexOf(_imageFileNameWithoutExt + "/")) + (_imageFileNameWithoutExt + "/").length,
                e.search(/\.[0-9]\.png/)
            );
        } else {
            name = e.substring(
                (e.indexOf(_imageFileNameWithoutExt + "/")) + (_imageFileNameWithoutExt + "/").length,
                e.lastIndexOf(".")
            );
        }

        if(name[0] === "/") {
            name = name.substring(1);
        }

        // name = replaceSpaces(name);

        if(_mode == "pixi") {
            res.frames[name] = {
                "frame": {
                    x: _spritesmithData.coordinates[_e].x,
                    y: _spritesmithData.coordinates[_e].y,
                    w: _spritesmithData.coordinates[_e].width,
                    h: _spritesmithData.coordinates[_e].height,
                },
                "rotated": false,
                "trimmed": false,
                "spriteSourceSize": {
                    x: 0,
                    y: 0,
                    w: _spritesmithData.coordinates[_e].width,
                    h: _spritesmithData.coordinates[_e].height,
                },
                "sourceSize": {
                    w: _spritesmithData.coordinates[_e].width,
                    h: _spritesmithData.coordinates[_e].height,
                },
            };
        } else if(_mode == "playcanvas") {
            res.frames[name] = ({
                rect: [
                    _spritesmithData.coordinates[_e].x,
                    _spritesmithData.coordinates[_e].y + _spritesmithData.coordinates[_e].height,
                    _spritesmithData.coordinates[_e].width,
                    _spritesmithData.coordinates[_e].height,
                ],
                pivot: [0, 0],
            });
        }
    });

    return res;
}
