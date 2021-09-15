const micromatch = require("micromatch");
const yaml = require("js-yaml");

class YAMLTransformer {
    constructor(config) {
        this.config = config;
        this.result = "";
    }

    transform(code) {
        let result = this.parseDocument(code);
        if(this.config.escape) result = this.escapeText(result);
        return result;
    }

    parseDocument(code) {
        const doc = yaml.load(code);

        if (typeof doc === "object") return this.parseObject(doc, "");
        return "";
    }

    parseObject(obj, prefix) {
        Object.entries(obj).forEach(([key, val]) => {
            if (typeof val === "string" || typeof val === "number") this.result += `${prefix}${prefix ? this.config.separator : ""}${key}=${val}\n`;
            if (typeof val === "object") this.parseObject(val, prefix + (prefix ? this.config.separator : "") + key);
        });
        return this.result;
    }

    escapeCharacter(character) {
        let charcode = character.charCodeAt(0);
        if (charcode > 127) {
            let asciiChar = charcode.toString(16);
            asciiChar = new String("0000").substring(asciiChar.length, 4) + asciiChar;
            return "\\u" + asciiChar;
        } else {
            return character;
        }
    }

    escapeText(text) {
        let newText = "";
        for (let i = 0; i < text.length; i++) {
            let newChar = text[i];
            newChar = this.escapeCharacter(newChar);
            newText += newChar;
        }
        return newText;
    }

}

function includeFiles(files, patterns) {
    const matchableFiles = files.map((file) => file.getPath());
    let matches = micromatch(matchableFiles, patterns);
    return files.filter((file) => matches.includes(file.getPath()));
}

function excludeFiles(files, patterns) {
    const matchableFiles = files.map((file) => file.getPath());
    let matches = micromatch(matchableFiles, patterns);
    return files.filter((file) => !matches.includes(file.getPath()));
}

function removeFileExtension(path) {
    let parts = path.split(".");
    parts.pop();
    return parts.join(".");
}

module.exports = {
    includeFiles,
    excludeFiles,
    removeFileExtension,
    YAMLTransformer,
};
