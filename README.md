# Typed Route Builder

[![GitHub license](https://img.shields.io/github/license/pvdstel/typed-route-builder.svg?style=flat-square)](https://github.com/pvdstel/typed-route-builder/blob/master/LICENSE)[![npm version](https://img.shields.io/npm/v/typed-route-builder.svg?style=flat-square)](https://www.npmjs.com/package/typed-route-builder)![npm bundle size](https://img.shields.io/bundlephobia/minzip/typed-route-builder.svg?style=flat-square)

A proof of concept demonstrating that it is possible to automatically build type-safe routes in TypeScript.

## Installing

Run <kbd>yarn add typed-route-builder</kbd> (or <kbd>npm install --save typed-route-builder</kbd>) to install this package as a dependency. TypeScript definitions are included with the package.

## Background

This code was designed with [react-router](https://github.com/ReactTraining/react-router) in mind. By using any of the functions provided, a path will be generated that is compatible with the `Route` component. This concept was conceived while looking for an alternative way to store application routes for `react-router`, while simultaneously having a way for these routes to be typed.

## Developing

- Run <kbd>yarn</kbd> to install dependencies.
- Run <kbd>yarn build</kbd> to build the TypeScript project.
- Run <kbd>yarn start</kbd> to run the example file.

This repository includes a configuration for Visual Studio Code, allowing for easier debugging.

## Code

The `ITypedRoute` interface contains a number of members:

- The template string is the string that should be passed to the `Route` component as the `path` prop.
- The `paramemeters` member is always `undefined` and should not be used directly. Instead, its type should be used. It is possible to use this type as a generic argument of the `RouteComponentProps` type, so that the routing parameters are typed automatically. For example:
    ```ts
    type PropsType = RouteComponentProps<typeof typedRoute.params>;
    ```
- The `fill` member is either a string or a function, depending on whether parameters are present in the typed route. If there are no parameters, this field will be equal to the template string. If there are parameters, it is possible to fill them in as follows:
    ```ts
    const url = typedRoute.fill(param1)(param2)(param3);
    ```

### Functions

There are several functions that create or update `ITypedRoute` objects. These functions do not mutate the objects passed into them.

- `createTypedRoute` constructs a route object. It has one optional parameter, which can be used to define a base path. This parameter should not have a trailing slash.
    ```ts
    const route = createTypedRoute();
    ```
- `addSegment` accepts one parameter, the segment to add. It returns a function that accepts an `ITypedRoute` object and returns a new `ITypedRoute` with the segment added.
    ```ts
    const withSegment = addSegment('users')(route);
    ```
- `addParam` accepts one parameter. It returns a function that accepts an `ITypedRoute` object and returns a new `ITypedRoute` with the parameter added. The parameter type is always `string`.
    ```ts
    const withParam = addParam('id')(withSegment);
    ```
- `addOptionalParam` accepts one parameter. It does roughly the same as `addParam`, except that the value can now be optional (and thus `undefined`). It returns a function that accepts an `ITypedRoute` object and returns a new `ITypedRoute` with the parameter added. The parameter type is always `string?`.
    ```ts
    const withOptionalParam = addParam('tab')(withParam);
    ```

After executing the above lines of code, we will see the following output:

```ts
console.log(withOptionalParam.path);
// /users/:id/:tab?

console.log(withOptionalParam.params);
// undefined

console.log(withOptionalParam.fill('42')('password'));
// /users/42/password
```

### Builder

This entire API is wrapped in a builder class, `TypedRouteBuilder`, which can be used as follows:

```ts
const builtRoute = new TypedRouteBuilder()
    .segment('users')
    .param('id')
    .optionalParam('tab')
    .build();
```

Using this builder, `builtRoute` will now be identical to the `withOptionalParam` object from the example above.
