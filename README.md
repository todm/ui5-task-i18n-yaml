# ui5-task-i18n-yaml

Task (and **Middleware**) for transforming YAML files into ui5 compatible i18n property files. Nested objects will be flattened.

# Installation

Add the task to your project as a dev dependency.

```
npm i -D git+https://github.com/todm/ui5-task-i18n-yaml.git
```

Add the package to the ui5 dependencies of `package.json`

```yaml
"ui5": {
  "dependencies": [
    #...
    "ui5-task-i18n-yaml",
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

# Configuration

## Task Configuration

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

| Name          | Type                 | Default                     | Description                                                                                                   |
| ------------- | -------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| include       | `string \| string[]` | `["**/i18n*.properties"]`   | Files that should be included                                                                                 |
| exclude       | `string \| string[]` | `[]`                        | Files that should be excluded                                                                                 |
| separator     | `string`             | `"_"`                       | The separator to use when flattening objects                                                                  |
| escape        | `boolean`            | `false`                     | Escape files in the task                                                                                      |
| searchInclude | `string \| string[]` | `["**/*.yaml", "**/*.yml"]` | Files that should be included when Searching the project                                                      |
| passFile      | `boolean`            | `false`                     | Wether the file should be passed to the next middleware (Only works if next middleware checks req.passedFile) |

# Example

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
