const {YAMLTransformer, excludeFiles, removeFileExtension} = require('.');

/**
 * i18n yaml task
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {object} parameters.taskUtil Specification Version dependent interface to a
 *                [TaskUtil]{@link module:@ui5/builder.tasks.TaskUtil} instance
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.projectNamespace] Project namespace if available
 * @param {string} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
 module.exports = async function({workspace, dependencies, taskUtil, options}) {
    const config = {
        include: ["**/i18n*.yaml", "**/i18n*.yml"],
        exclude: [],
        separator: '_',
        escape: false,
        forceExtension: 'properties',
        ...options.configuration
    }

    let files = await workspace.byGlob(config.include);
    files = excludeFiles(files, config.exclude);
    await Promise.all(files.map(async file => {
        const yamlTransformer = new YAMLTransformer(config);
        let code = await file.getString();
        let result = yamlTransformer.transform(code);
        file.setString(result);
        if(config.forceExtension) file.setPath(removeFileExtension(file.getPath()) + "." + config.forceExtension);
        workspace.write(file)
    }));

};