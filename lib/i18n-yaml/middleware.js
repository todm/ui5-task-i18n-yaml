const { YAMLTransformer, includeFiles, removeFileExtension, getExtension, Logger } = require('.');
const micromatch = require('micromatch');

/**
 * i18n yaml middleware
 *
 * @param {object} parameters Parameters
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
module.exports = async ({ resources, middlewareUtil, options }) => {
    const config = {
        include: ["**/*.properties"],
        exclude: [],
        separator: '_',
        escape: false,
        searchInclude: ["**/*.yaml", "**/*.yml"],
        passFile: false,
        onError: 'error',
        ...options.configuration
    }

    const potentialFiles = await resources.rootProject.byGlob(config.searchInclude);
    let fileMap = new Map();
    for (const file of potentialFiles) {
        const code = await file.getString();
        const yamlTransformer = new YAMLTransformer(config);
        const documents = yamlTransformer.parseFile(code, file.getPath());
        documents.forEach(d => {
            let fp = removeFileExtension(d.filePath);
            fileMap.set(fp, file.getPath());
        });
    }
    delete potentialFiles;

    return async (req, res, next) => {
        try {
            let matched = !!micromatch([req.path], config.include).length && !micromatch([req.path], config.exclude).length;
            if (!matched) return next();

            const yamlTransformer = new YAMLTransformer(config);

            let result;
            if (req.passedFile) {
                const code = await req.passedFile.getString();

                result = yamlTransformer.parseFile(code, req.passedFile.getPath())[0].properties;
            } else {
                let containingFile = fileMap.get(
                    removeFileExtension(req.path)
                );
                if (!containingFile) return next();
                let file = await resources.rootProject.byGlob(containingFile);
                file = file[0];
                const code = await file.getString();
                const docs = yamlTransformer.parseFile(code, file.getPath());

                result = docs.find(d => removeFileExtension(d.filePath) === removeFileExtension(req.path)).properties;
            }

            if (config.passFile) {
                let file = dummyFile.clone();
                file.setString(result);
                file.setPath(req.path);
                req.passedFile = file;
                return next();
            }
            res.end(result);
        } catch (ex) {
            Logger.error(ex.message);
            if(config.onError === "next"){
                next();
            } else if(config.onError === "error") {
                res.status(503);
                res.end();
            } else {
                process.exit(-1);
            }
        }
    }
};