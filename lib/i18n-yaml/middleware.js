const {YAMLTransformer, includeFiles, removeFileExtension} = require('.');
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
        ...options.configuration
    }

    return async (req, res, next) => {
        let matched = !!micromatch([req.path], config.include).length && !micromatch([req.path], config.exclude).length;
        if(!matched) return next();

        let file;
        if(req.passedFile) {
            file = req.passedFile;
        } else {
            let potentialFiles = await resources.rootProject.byGlob(removeFileExtension(req.path) + ".*");
            potentialFiles = includeFiles(potentialFiles, config.searchInclude);
            if(!potentialFiles.length) return next();
            file = potentialFiles[0];
        }

        const yamlTransformer = new YAMLTransformer(config);
        let code = await file.getString();
        let result = yamlTransformer.transform(code);

        if(config.passFile) {
            file.setString(result);
            req.passedFile = file;
            return next();
        }
        res.end(result);
    }
};