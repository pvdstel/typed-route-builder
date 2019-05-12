# TypeScript typed routes

A proof of concept demonstrating that it is possible to automatically build type-safe routes in TypeScript.

## Background

This code was designed with [react-router](https://github.com/ReactTraining/react-router) in mind. By using any of the functions provided, a path will be generated that is compatible with the `Route` component. This concept was conceived while looking for an alternative way to store application routes for `react-router`, while simultaneously having a way for these routes to be typed.

## Using this project

- Run <kbd>yarn</kbd> to install dependencies.
- Run <kbd>yarn build</kbd> to build the TypeScript project.
- Run <kbd>yarn start</kbd> to run the example file.

This repository includes a configuration for Visual Studio Code, allowing for easier debugging.

## Code

The `ITypedRoute` interface contains a number of members:

- The template string is the string that should be passed to the `Route` component as the `path` prop.
- The `paramemeters` member is always `undefined` and should not be used directly. Instead, its type should be used. It is possible to use this type as a generic argument of the `RouteComponentProps` type, so that the routing parameters are typed automatically. For example:
    ```ts
    type PropsType = RouteComponentProps<typeof typedRoute.parameters>;
    ```
- The `fillAll` member is a function that accepts values corresponding to the provided parameters, optional or not. Arguments should be given in reverse, due to a limitation in how typechecking is done. To have correct type checking on this function, at least `strictFunctionTypes` should be enabled in the TypeScript project settings.
- The `filled` member is either a string or a function, depending on whether parameters are present in the typed route. If there are no parameters, this field will be equal to the template string. If there are parameters, it is possible to fill them in as follows:
    ```ts
    const url = typedRoute.filled(param1)(param2)(param3);
    ```

There are several functions that create or update `ITypedRoute` objects. These functions do not mutate the objects passed into them.

- `createTypedRoute` constructs a route object. It has one optional parameter, which can be used to define a base path. This parameter should not have a trailing slash.
    ```ts
    const route = createTypedRoute();
    ```
- `addSegment` accepts one parameter, the segment to add. It returns a function that accepts an `ITypedRoute` object and returns a new `ITypedRoute` with the segment added.
    ```ts
    const withSegment = addSegment('users')(route);
    ```
- `addParameter` accepts one type parameter and one parameter. The type parameter defines how the parameters type should be extened, whereas the function parameter passes the name of this parameter so that it can be used correctly. It returns a function that accepts an `ITypedRoute` object and returns a new `ITypedRoute` with the parameter added.
    ```ts
    const withParameter = addParameter<{ id: number }>('id')(withSegment);
    ```
- `addOptionalParameter` accepts one type parameter and one parameter. It does roughly the same as `addParameter`, except that the value can now be optional (and thus `undefined`). It returns a function that accepts an `ITypedRoute` object and returns a new `ITypedRoute` with the parameter added.
    ```ts
    const withOptionalParameter = addParameter<{ tab: string }>('tab')(withParameter);
    ```

After executing the above lines of code, we will see the following output:

```ts
console.log(withOptionalParameter.template);
// /users/:id/:tab?

console.log(withOptionalParameter.parameters);
// undefined

console.log(withOptionalParameter.fillAll('password', 42));
// /users/42/password

console.log(withOptionalParameter.filled(42)('password'));
// /users/42/password
```

This entire API is wrapped in a builder class, `TypedRouteBuilder`, which can be used as follows:

```ts
const builtRoute = new TypedRouteBuilder()
    .segment('users')
    .parameter<{ id: number }>('id')
    .optionalParameter<{ tab: string }>('tab')
    .build();
```

Using this builder, `builtRoute` will now be identical to the `withOptionalParameter` object from the example above.
