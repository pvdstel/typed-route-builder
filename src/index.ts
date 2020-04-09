type FillType = string | ((arg: any) => FillType);
type FillExpander<TFillFn, TAdding> = (TFillFn extends (arg: infer TFillFnParams) => infer TFillFnReturn
    ? (arg: TFillFnParams) => FillExpander<TFillFnReturn, TAdding>
    : (TFillFn extends string
        ? (arg: TAdding) => string
        : never
    )
);

/** An interface representing a typed route. */
export interface ITypedRoute<TParams extends {}, TFill extends FillType> {
    /** The template string for this route. */
    template: string;
    /** The parameters this route provides. Will always be `undefined`. Intended usage is `typeof typedRoute.parameters`. */
    parameters: TParams;
    /** Gets the template string, where all parameters are filled in using curried functions. */
    fill: TFill;
}

/**
 * Creates a typed route object.
 * @param path The path to start the route with. Defaults to the empty string.
 */
export function createTypedRoute(path: string = ''): ITypedRoute<{}, string> {
    return {
        template: path,
        parameters: undefined as any,
        fill: path,
    };
}

/**
 * Defers execution of filling in the values of route parameters.
 * @param routeArgs The route's args.
 */
function makeFillCurry<R extends FillType>(routeArgs: R): any {
    if (typeof routeArgs === 'string') {
        return (arg: any) => arg !== undefined
            ? `${routeArgs}/${arg}`
            : routeArgs;
    } else {
        return (arg: any) => {
            if (arg !== undefined) {
                const nestedArgs = (routeArgs as (x: any) => any)(arg);
                return makeFillCurry(nestedArgs);
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
    return <R extends ITypedRoute<{}, FillType> = ITypedRoute<{}, FillType>>
        (route: R): ITypedRoute<
            ExtractParams<R>,
            ExtractFill<R>
        > => {
        // For segments, `makeFillCurry` is not necessary as it can expand right away.
        return {
            template: `${route.template}/${segment}`,
            parameters: undefined as any,
            fill: (typeof route.fill === 'string'
                ? `${route.fill}/${segment}`
                : (arg: any) => `${(route.fill as (arg: any) => any)(arg)}/${segment}`
            ) as any,
        };
    };
}

/**
 * Adds a parameter to the typed route object.
 * @param name The name of the parameter to add.
 * @returns A function accepting a typed route object, returning a new typed route object with the parameter added.
 */
export function addParameter<P extends string = string, Ps extends { [K in P]: string } = { [K in P]: string }>(name: P) {
    return <R extends ITypedRoute<{}, FillType> = ITypedRoute<{}, FillType>>
        (route: R): ITypedRoute<
            ExtractParams<R> & Ps,
            FillExpander<ExtractFill<R>, Ps[typeof name]>
        > => {
        return {
            template: `${route.template}/:${name}`,
            parameters: undefined as any,
            fill: makeFillCurry(route.fill),
        };
    };
}

/**
 * Adds an optional parameter to the typed route object.
 * @param name The name of the optional parameter to add.
 * @returns A function accepting a typed route object, returning a new typed route object with the optional parameter added.
 */
export function addOptionalParameter<P extends string = string, Ps extends { [K in P]: string } = { [K in P]: string }>(name: P) {
    return <R extends ITypedRoute<{}, FillType> = ITypedRoute<{}, FillType>>
        (route: R): ITypedRoute<
            ExtractParams<R> & Partial<Ps>,
            FillExpander<ExtractFill<R>, Ps[typeof name] | undefined>
        > => {
        return {
            template: `${route.template}/:${name}?`,
            parameters: undefined as any,
            fill: makeFillCurry(route.fill),
        };
    };
}

/** A builder class for typed routes. */
export class TypedRouteBuilder<TParams extends {} = {}, TArgs extends FillType = string> {
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
    public parameter: <P extends string = string, Ps extends { [K in P]: string } = { [K in P]: string }>
        (name: P) => TypedRouteBuilder<
            ExtractParams<this> & Ps,
            FillExpander<ExtractFill<this>, Ps[typeof name]>
        > = name => {
            this._typedRoute = addParameter(name)(this._typedRoute as any) as any;
            return this as any;
        }

    /**
     * Adds an optional to the typed route object.
     * @param name The name of the optional parameter to add.
     */
    public optionalParameter: <P extends string = string, Ps extends { [K in P]: string } = { [K in P]: string }>
        (name: P) => TypedRouteBuilder<
            ExtractParams<this> & Partial<Ps>,
            FillExpander<ExtractFill<this>, Ps[typeof name] | undefined>
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
/** Helper type used to obtain the `TFill` generic type argument. */
type ExtractFill<T> = (T extends ITypedRoute<any, infer TFill>
    ? TFill
    : (T extends TypedRouteBuilder<any, infer TFill>
        ? TFill
        : never
    )
);
