# ui5-task-i18n-yaml

Task (and **Middleware**) for transforming YAML files into ui5 compatible i18n property files.

_Why?_ When using yaml files for your translations you can use all the usefull yaml features like **nesting**, **json syntax**, **anchors** and **multiple documents in one file**.

# Installation

Add the task to your project as a dev dependency.

```
npm i -D @todms/ui5-task-i18n-yaml
```

Add the package to the ui5 dependencies of `package.json`

```yaml
"ui5": {
  "dependencies": [
    #...
    "@todms/ui5-task-i18n-yaml",
  ]
}
```

# Include Task

Include the task in `ui5.yaml`

Task:

```yaml
builder:
  customTasks:
    - name: ui5-task-i18n-yaml
      beforeTask: escapeNonAsciiCharacters
```

Server Middleware:

```yaml
server:
  customMiddleware:
    - name: ui5-middleware-i18n-yaml
      beforeMiddleware: serveResources
```

# Examples

## Nesting

Normal properties will be directly transformed to i18n properties. Nested objects and arrays will be prefixed with their parent and flattened to a i18n property. Most YAML features like comments, anchors and multi line strings work.

```yaml
property1: Lorem Ipsum
property2: dolor sit amet
property3:
  nestedProperty1: consectetuer
  nestedProperty2: adipiscing elit
  nestedArray:
    - Aenean
    - commodo
    - ligula
```

Will turn into

```properties
property1=Lorem Ipsum
property2=dolor sit amet
property3_nestedProperty1=consectetuer
property3_nestedProperty2=adipiscing elit
property3_nestedArray_0=Aenean
property3_nestedArray_1=commodo
property3_nestedArray_2=ligula
```

## Multiple documents

If you want to write multiple documents in one file you can define the `__file` property to define the resulting filename. If no `__file` property gets specified the documents will be numbered.

```yaml
# i18n.yaml

# 1st unnamed document will use input filename => i18n.properties
property1: Lorem Ipsum
property2: dolor sit amet
---
# 2nd unnamed document will be numbered => i18n_1.properties
property1: Lorem Ipsum
property2: dolor sit amet
---
# named document will use __file => i18n_de.properties
__file: i18n_de
property1: Lorem Ipsum
property2: dolor sit amet
```

# Configuration

### Task Configuration

You can add the following configurations to the task:

| Name           | Type                 | Default                             | Description                                           |
| -------------- | -------------------- | ----------------------------------- | ----------------------------------------------------- |
| include        | `string \| string[]` | `["**/i18n*.yaml", "**/i18n*.yml"]` | Files that should be included                         |
| exclude        | `string \| string[]` | `[]`                                | Files that should be excluded                         |
| separator      | `string`             | `"_"`                               | The separator to use when flattening objects          |
| escape         | `boolean`            | `false`                             | Escape files in the task                              |
| forceExtension | `false \| string`    | `"properties"`                      | Force a specific file extension for transformed files |

### Middleware Configuration

You can add the following configurations to the middleware:

| Name          | Type                      | Default                     | Description                                                                                                                               |
| ------------- | ------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| include       | `string \| string[]`      | `["**/i18n*.properties"]`   | Files that should be included                                                                                                             |
| exclude       | `string \| string[]`      | `[]`                        | Files that should be excluded                                                                                                             |
| separator     | `string`                  | `"_"`                       | The separator to use when flattening objects                                                                                              |
| escape        | `boolean`                 | `false`                     | Escape files in the task                                                                                                                  |
| searchInclude | `string \| string[]`      | `["**/*.yaml", "**/*.yml"]` | Files that should be included when Searching the project                                                                                  |
| passFile      | `boolean`                 | `false`                     | Wether the file should be passed to the next middleware (Only works if next middleware checks req.passedFile)                             |
| onError       | `'next'\|'error'\|'exit'` | `'error'`                   | Defines behaviour when an error occures. `next`: next middleware will be called, `error`: server will return 503, `exit`: Server will end |
