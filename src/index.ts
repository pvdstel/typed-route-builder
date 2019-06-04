type FilledType = string | ((arg: any) => FilledType);
type FilledExpander<TFillFn, TAdding> = (TFillFn extends (arg: infer TFillFnParams) => infer TFillFnReturn
    ? (arg: TFillFnParams) => FilledExpander<TFillFnReturn, TAdding>
    : (TFillFn extends string
        ? (arg: TAdding) => string
        : never
    )
);

/** An interface representing a typed route. */
export interface ITypedRoute<TParams extends {}, TFilled extends FilledType> {
    /** The template string for this route. */
    template: string;
    /** The parameters this route provides. Will always be `undefined`. Intended usage is `typeof typedRoute.parameters`. */
    parameters: TParams;
    /** Gets the template string, where all parameters are filled in using curried functions. */
    filled: TFilled;
}

/**
 * Creates a typed route object.
 * @param path The path to start the route with. Defaults to the empty string.
 */
export function createTypedRoute(path: string = ''): ITypedRoute<{}, string> {
    return {
        template: path,
        parameters: undefined as any,
        filled: path,
    };
}

/**
 * Defers execution of filling in the values of route parameters.
 * @param routeArgs The route's args.
 */
function makeFilledCurry<R extends FilledType>(routeArgs: R): any {
    if (typeof routeArgs === 'string') {
        return (arg: any) => arg !== undefined
            ? `${routeArgs}/${arg}`
            : routeArgs;
    } else {
        return (arg: any) => {
            if (arg !== undefined) {
                const nestedArgs = (routeArgs as (x: any) => any)(arg);
                return makeFilledCurry(nestedArgs);
            } else {
                return routeArgs;
            }
        };
    }
}

/**
 * Adds a segment to the typed route object.
 * @param segment The segment to add.
 * @returns A function accepting a typed route object, returning a new typed route object with segment added.
 */
export function addSegment(segment: string) {
    return <R extends ITypedRoute<{}, FilledType> = ITypedRoute<{}, FilledType>>
        (route: R): ITypedRoute<
            ExtractParams<R>,
            ExtractFilled<R>
        > => {
        // For segments, `makeFilledCurry` is not necessary as it can expand right away.
        return {
            template: `${route.template}/${segment}`,
            parameters: undefined as any,
            filled: (typeof route.filled === 'string'
                ? `${route.filled}/${segment}`
                : (arg: any) => `${(route.filled as (arg: any) => any)(arg)}/${segment}`
            ) as any,
        };
    };
}

/**
 * Adds a parameter to the typed route object.
 * @param name The name of the parameter to add.
 * @returns A function accepting a typed route object, returning a new typed route object with the parameter added.
 */
export function addParameter<P extends object = any>(name: keyof P) {
    return <R extends ITypedRoute<{}, FilledType> = ITypedRoute<{}, FilledType>>
        (route: R): ITypedRoute<
            ExtractParams<R> & P,
            FilledExpander<ExtractFilled<R>, P[typeof name]>
        > => {
        return {
            template: `${route.template}/:${name}`,
            parameters: undefined as any,
            filled: makeFilledCurry(route.filled),
        };
    };
}

/**
 * Adds an optional parameter to the typed route object.
 * @param name The name of the optional parameter to add.
 * @returns A function accepting a typed route object, returning a new typed route object with the optional parameter added.
 */
export function addOptionalParameter<P extends object = any>(name: keyof P) {
    return <R extends ITypedRoute<{}, FilledType> = ITypedRoute<{}, FilledType>>
        (route: R): ITypedRoute<
            ExtractParams<R> & Partial<P>,
            FilledExpander<ExtractFilled<R>, P[typeof name] | undefined>
        > => {
        return {
            template: `${route.template}/:${name}?`,
            parameters: undefined as any,
            filled: makeFilledCurry(route.filled),
        };
    };
}

/** A builder class for typed routes. */
export class TypedRouteBuilder<TParams extends {} = {}, TArgs extends FilledType = string> {
    private _typedRoute: ITypedRoute<TParams, TArgs>;

    /** Initializes a new instance of the {@see TypedRouteBuilder} class. */
    constructor(typedRoute?: ITypedRoute<TParams, TArgs>) {
        this._typedRoute = typedRoute || createTypedRoute() as any;
    }

    /**
     * Adds a segment to the typed route object.
     * @param segment The segment to add.
     */
    public segment: (segment: string) => this = segment => {
        this._typedRoute = addSegment(segment)(this._typedRoute as any) as any;
        return this;
    }

    /**
     * Adds a parameter to the typed route object.
     * @param name The name of the parameter to add.
     */
    public parameter: <P extends object>
        (name: keyof P) => TypedRouteBuilder<
            ExtractParams<this> & P,
            FilledExpander<ExtractFilled<this>, P[typeof name]>
        > = name => {
            this._typedRoute = addParameter(name)(this._typedRoute as any) as any;
            return this as any;
        }

    /**
     * Adds an optional to the typed route object.
     * @param name The name of the optional parameter to add.
     */
    public optionalParameter: <P extends object>
        (name: keyof P) => TypedRouteBuilder<
            ExtractParams<this> & Partial<P>,
            FilledExpander<ExtractFilled<this>, P[typeof name] | undefined>
        > = name => {
            this._typedRoute = addOptionalParameter(name)(this._typedRoute as any) as any;
            return this as any;
        }

    /** Gets the typed route instance. */
    public build() {
        return this._typedRoute;
    }
}

/** Helper type used to obtain the `TParams` generic type argument. */
type ExtractParams<T> = (T extends ITypedRoute<infer TParams, any>
    ? TParams
    : (T extends TypedRouteBuilder<infer TParams, any>
        ? TParams
        : never
    )
);
/** Helper type used to obtain the `TFilled` generic type argument. */
type ExtractFilled<T> = (T extends ITypedRoute<any, infer TFilled>
    ? TFilled
    : (T extends TypedRouteBuilder<any, infer TFilled>
        ? TFilled
        : never
    )
);
