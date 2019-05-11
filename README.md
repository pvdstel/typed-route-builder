# TypeScript typed routes

A proof of concept demonstrating that it is possible to automatically build type-safe routes in TypeScript.

## Background

This code was designed with [react-router](https://github.com/ReactTraining/react-router) in mind. By using any of the functions provided, a path will be generated that is compatible with the `Route` component. This concept was conceived while looking for an alternative way to store application routes for `react-router`, while simultaneously having a way for these routes to be typed.

## Code

The `ITypedRoute` interface contains three members: a template string, an empty `parameters` member, and a fill function.

- The template string is the string that should be passed to the `Route` component as the `path` prop.
- The `paramemeters` member is always `undefined` and should not be used directly. Instead, its type should be used. It is possible to use this type as a generic argument of the `RouteComponentProps` type, so that the routing parameters are typed automatically. For example:

    ```ts
    type PropsType = RouteComponentProps<typeof typedRoute.parameters>;
    ```
- The `fill` function is a function that accepts values corresponding to the provided parameters, optional or not. Arguments should be given in reverse, due to a limitation in how typechecking occurs. To have correct type checking on this method, at least `strictFunctionTypes` should be enabled in the TypeScript project settings.
