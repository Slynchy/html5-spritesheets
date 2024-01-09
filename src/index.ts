import * as fs from "fs";
import * as path from "path";
const spritesmith = require("spritesmith");
import { ISpritesmithResult } from "./types/ISpritesmithResult";
import { createSpritesheetJSON } from "./createSpritesheetJsonFromSpritesmithResult";
import { replaceSpaces } from "./replaceSpaces";

const args = process.argv.slice(2);
const SILENT: boolean = false;

/**
 * Default paths to input/output folders
 * (for structure of `targetFolder/spritesheet/sprite.png`)
 */
const DEFAULT_INPUT_PATH = "./input";
const DEFAULT_OUTPUT_PATH = "./output";

enum RESULT_CODES {
    SUCCESS = 0,
    INVALID_INPUT_PATH = "Input path could not be resolved",
    INVALID_OUTPUT_FORMAT = "Invalid output format specified",
    NO_INPUT_FILES_FOUND = "No files found in the input path provided",
}

function handleError(err: unknown, rejFunction?: (err: unknown) => void): void {
    // if(STRICT_MODE) {
        if(rejFunction) {
            rejFunction(err);
        } else {
            // @ts-ignore
            throw new Error(err);
        }
    // } else {
    //     console.error(err);
    // }
}

function log(str: string) {
    if(!SILENT)
        console.log(str);
}

async function main() {
    // iterate
    if(args.length < 1) {
        console.log(`
Usage:
    h5buildspritesheet [input path] [output path (optional)] [flags]
    
Flags:
    -f [format] - Output format, either pixi or playcanvas 
`)
        return;
    }

    const outputMode: "pixi" | "playcanvas" =
        args[args.findIndex((a) => a == "-f") + 1] as "pixi" | "playcanvas";
    if(outputMode !== "pixi" && outputMode !== "playcanvas") {
        handleError(
            RESULT_CODES.INVALID_OUTPUT_FORMAT
        );
    }

    let inputPath = path.resolve(args[0]);
    const outputPath = path.resolve(args[1] ? args[1] : DEFAULT_OUTPUT_PATH);
    if(!fs.existsSync(inputPath)) {
        handleError(RESULT_CODES.INVALID_INPUT_PATH);
        inputPath = path.resolve(DEFAULT_INPUT_PATH);
    }

    const promises: Promise<ISpritesmithResult>[] = [];
    const spritesheetFolderPaths = fs.readdirSync(inputPath)
        .map((e) => path.resolve(inputPath + "/" + e));
    let numOfInvalidFiles = 0;
    spritesheetFolderPaths.forEach((sheetPath) => {
        if(!fs.existsSync(sheetPath) || !fs.lstatSync(sheetPath).isDirectory()) {
            numOfInvalidFiles++;
            return;
        }
        const pngFilePaths = fs.readdirSync(sheetPath)
            .map((e) =>
                path.resolve(sheetPath + "/" + e)
            )
            .filter(
                (e) => e.lastIndexOf(".png") === (e.length - ".png".length)
            );
        if(!pngFilePaths.length) {
            console.warn(`Spritesheet path does not contain any PNG files: ${sheetPath}`);
            return;
        }

        const spritesmithResult: Promise<ISpritesmithResult> = new Promise((resolve, reject) => {
            console.log("Building %s...", path.basename(sheetPath));
            spritesmith.run({
                src: pngFilePaths,
                padding: 2,
            }, function handleResult(err: Error, result: ISpritesmithResult) {
                if (err) reject(err);
                else {
                    const filename =  replaceSpaces(path.basename(sheetPath));
                    fs.writeFileSync(`${outputPath}/${filename}.png`, result.image, "base64");
                    log(`Wrote ${filename}.png`);

                    const spritesheetJson = createSpritesheetJSON(
                        sheetPath + ".png",
                        result,
                        outputMode
                    );
                    fs.writeFileSync(
                        `${outputPath}/${filename}.json`,
                        JSON.stringify(spritesheetJson, null, "  "),
                        "utf8"
                    );
                    log(`Wrote ${filename}.json`);

                    resolve(result);
                }
            });
        });
        promises.push(spritesmithResult);
    });
    if(numOfInvalidFiles === spritesheetFolderPaths.length) {
        throw new Error(RESULT_CODES.NO_INPUT_FILES_FOUND);
    }

    await Promise.allSettled(
        promises
    );

    return RESULT_CODES.SUCCESS;

}

main()
    .catch((err) => {
        console.error(`Fatal error encountered: ${err.message}`);
        return err.message;
    })
    .then((resultCode: RESULT_CODES | undefined) => {
        console.log("Script ended with message " + resultCode);
    });
