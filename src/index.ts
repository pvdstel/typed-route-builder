type FillType = string | ((arg: any) => FillType);
type FillExpander<TFillFn, TAdding> = (TFillFn extends (arg: infer TFillFnParams) => infer TFillFnReturn
    ? (arg: TFillFnParams) => FillExpander<TFillFnReturn, TAdding>
    : (TFillFn extends string
        ? (arg: TAdding) => string
        : never
    )
);

/** An interface representing a typed route. */
export interface ITypedRoute<TParams extends {}, TBuild extends any[], TFill extends FillType> {
    /** The template string for this route. */
    path: string;
    /** The parameters this route provides. Will always be `undefined`. Intended usage is `typeof typedRoute.parameters`. */
    params: TParams;
    /** Gets the template string, where all parameters are filled in using curried functions. */
    fill: TFill;
    /** Gets the template string, where all parameters are filled in in order. */
    build: (...params: TBuild) => string;
}

/**
 * Creates a typed route object.
 * @param path The path to start the route with. Defaults to the empty string.
 */
export function createTypedRoute(path: string = ''): ITypedRoute<{}, [], string> {
    return {
        path,
        params: undefined as any,
        fill: path,
        build: () => path,
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
    return <R extends ITypedRoute<{}, any[], FillType> = ITypedRoute<{}, [], FillType>>
        (route: R): ITypedRoute<
            ExtractParams<R>,
            ExtractBuild<R>,
            ExtractFill<R>
        > => {
        // For segments, `makeFillCurry` is not necessary as it can expand right away.
        return {
            path: `${route.path}/${segment}`,
            params: undefined as any,
            fill: (typeof route.fill === 'string'
                ? `${route.fill}/${segment}`
                : (arg: any) => `${(route.fill as (arg: any) => any)(arg)}/${segment}`
            ) as any,
            build: (...params: ExtractBuild<R>) => `${route.build(...params)}/${segment}`,
        };
    };
}

/**
 * Adds a parameter to the typed route object.
 * @param name The name of the parameter to add.
 * @returns A function accepting a typed route object, returning a new typed route object with the parameter added.
 */
export function addParam<P extends string = string, Ps extends { [K in P]: string } = { [K in P]: string }>(name: P) {
    return <R extends ITypedRoute<{}, any[], FillType> = ITypedRoute<{}, [], FillType>>
        (route: R): ITypedRoute<
            ExtractParams<R> & Ps,
            [...ExtractBuild<R>, Ps[typeof name]],
            FillExpander<ExtractFill<R>, Ps[typeof name]>
        > => {
        return {
            path: `${route.path}/:${name}`,
            params: undefined as any,
            fill: makeFillCurry(route.fill),
            build: (...params: [...ExtractBuild<R>, Ps[typeof name]]) => {
                const param = params[params.length - 1];
                const restParams = params.slice(0, -1);

                return `${route.build(...restParams)}/${param}`;
            },
        };
    };
}

/**
 * Adds an optional parameter to the typed route object.
 * @param name The name of the optional parameter to add.
 * @returns A function accepting a typed route object, returning a new typed route object with the optional parameter added.
 */
export function addOptionalParam<P extends string = string, Ps extends { [K in P]?: string } = { [K in P]?: string }>(name: P) {
    return <R extends ITypedRoute<{}, any[], FillType> = ITypedRoute<{}, [], FillType>>
        (route: R): ITypedRoute<
            ExtractParams<R> & Ps,
            [...ExtractBuild<R>, Ps[typeof name] | undefined],
            FillExpander<ExtractFill<R>, Ps[typeof name] | undefined>
        > => {
        return {
            path: `${route.path}/:${name}?`,
            params: undefined as any,
            fill: makeFillCurry(route.fill),
            build: (...params: [...ExtractBuild<R>, Ps[typeof name] | undefined]) => {
                const param = params[params.length - 1];
                const restParams = params.slice(0, -1);

                return param !== undefined
                    ? `${route.build(...restParams)}/${param}`
                    : route.build(...restParams);
            },
        };
    };
}

/** A builder class for typed routes. */
export class TypedRouteBuilder<TParams extends {} = {}, TBuild extends any[] = [], TArgs extends FillType = string> {
    private _typedRoute: ITypedRoute<TParams, TBuild, TArgs>;

    /** Initializes a new instance of the {@see TypedRouteBuilder} class. */
    constructor(typedRoute?: ITypedRoute<TParams, TBuild, TArgs>) {
        this._typedRoute = typedRoute || createTypedRoute() as any;
    }

    /**
     * Adds a segment to the typed route object.
     * @param segment The segment to add.
     */
    public segment: (segment: string) => this = segment => {
        this._typedRoute = addSegment(segment)(this._typedRoute as ITypedRoute<TParams, any[], TArgs>);
        return this;
    };

    /**
     * Adds a parameter to the typed route object.
     * @param name The name of the parameter to add.
     */
    public param: <P extends string = string, Ps extends { [K in P]: string } = { [K in P]: string }>
        (name: P) => TypedRouteBuilder<
            ExtractParams<this> & Ps,
            [...ExtractBuild<this>, Ps[typeof name]],
            FillExpander<ExtractFill<this>, Ps[typeof name]>
        > = name => {
            this._typedRoute = addParam(name)(this._typedRoute as ITypedRoute<TParams, any[], TArgs>) as any;
            return this as any;
        };

    /**
     * Adds an optional to the typed route object.
     * @param name The name of the optional parameter to add.
     */
    public optionalParam: <P extends string = string, Ps extends { [K in P]?: string } = { [K in P]?: string }>
        (name: P) => TypedRouteBuilder<
            ExtractParams<this> & Ps,
            [...ExtractBuild<this>, Ps[typeof name] | undefined],
            FillExpander<ExtractFill<this>, Ps[typeof name] | undefined>
        > = name => {
            this._typedRoute = addOptionalParam(name)(this._typedRoute as ITypedRoute<TParams, any[], TArgs>) as any;
            return this as any;
        };

    /** Gets the typed route instance. */
    public build = () => this._typedRoute;
}

/** Helper type used to obtain the `TParams` generic type argument. */
type ExtractParams<T> = (T extends ITypedRoute<infer TParams, any, any>
    ? TParams
    : (T extends TypedRouteBuilder<infer TParams, any, any>
        ? TParams
        : never
    )
);
/** Helper type used to obtain the `TWith` generic type argument. */
type ExtractBuild<T> = (T extends ITypedRoute<any, infer TBuild, any>
    ? TBuild
    : (T extends TypedRouteBuilder<any, infer TBuild, any>
        ? TBuild
        : never
    )
);
/** Helper type used to obtain the `TFill` generic type argument. */
type ExtractFill<T> = (T extends ITypedRoute<any, any, infer TFill>
    ? TFill
    : (T extends TypedRouteBuilder<any, any, infer TFill>
        ? TFill
        : never
    )
);
