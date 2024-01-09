

export function replaceSpaces(input: string, replaceValue: string = "_"): string {
    return input.replace(/\ /g, replaceValue);
}
