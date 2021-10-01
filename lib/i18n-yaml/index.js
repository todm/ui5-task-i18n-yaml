const micromatch = require("micromatch");
const yaml = require("js-yaml");
const path = require("path");

class YAMLTransformer {
    constructor(config) {
        this.config = config;
        this.result = "";
        this.index = 0;
    }

    parseFile(fileContent, filePath) {
        const docs = yaml.loadAll(fileContent);

        const files = docs.map(doc => ({
            properties: this.parseDocument(doc),
            filePath: this.preaprePath(filePath, doc.__file)
        }));

        return files;
    }

    parseDocument(doc) {
        if (typeof doc !== "object") return "";

        this.result = "";
        let properties = this.flattenObject(doc, "");

        if (this.config.escape) properties = this.escapeText(properties);
        return properties;
    }

    preaprePath(filePath, fileName) {
        let extension = getExtension(filePath);
        let fileNoExt = removeFileExtension(filePath);
        let folder = filePath.split("/").slice(0,-1).join("/");

        let newPath = folder;

        //Write File
        if (fileName) {
            newPath = folder + "/" + fileName
        } else if (this.index !== 0) {
            newPath = fileNoExt + "_" + this.index++;
        } else {
            this.index++;
            newPath = fileNoExt;
        }

        newPath += ".";
        newPath += this.config.forceExtension ? this.config.forceExtension : extension;
        return newPath;
    }

    flattenObject(obj, prefix) {
        Object.entries(obj).forEach(([key, val]) => {
            if(key === "__file") return;
            if (typeof val === "string" || typeof val === "number") this.result += `${prefix}${prefix ? this.config.separator : ""}${key}=${val}\n`;
            if (typeof val === "object") this.flattenObject(val, prefix + (prefix ? this.config.separator : "") + key);
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

function removeFileExtension(filePath) {
    let parts = filePath.split(".");
    parts.pop();
    return parts.join(".");
}

function getExtension(filePath) {
    return filePath.split(".").pop();
}

function getFileName(filePath) {
    return filePath.split("/").pop();
}

module.exports = {
    includeFiles,
    excludeFiles,
    removeFileExtension,
    YAMLTransformer,
    getExtension,
    getFileName
};
