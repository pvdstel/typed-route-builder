type ArgsType = string | ((arg: any) => ArgsType);
type ArgsExpander<Args, Add> = (Args extends (arg: infer ArgsParams) => infer ArgsReturn
    ? (arg: ArgsParams) => ArgsExpander<ArgsReturn, Add>
    : (Args extends string
        ? (arg: Add) => string
        : never
    )
);

/** An interface representing a typed route. */
export interface ITypedRoute<TParams extends {}, TFillParams extends any[], TArgs extends ArgsType> {
    /** The template string for this route. */
    template: string;
    /** The parameters this route provides. Will always be `undefined`. Intended usage is `typeof typedRoute.parameters`. */
    parameters: TParams;
    /** 
     * A function that accepts the parameters in order, and places them in the template string.
     * 
     * **Note:** the parameters should be provided in reverse order. This is currently a TypeScript limitation.
     */
    fill: (...params: TFillParams) => string;
    /** Gets the template string, with all parameters filled in using curried functions. */
    args: TArgs;
}
type ExtractParams<T> = T extends ITypedRoute<infer TParams, any, any> ? TParams : never;
type ExtractFillParams<T> = T extends ITypedRoute<any, infer TFillParams, any> ? TFillParams : never;
type ExtractArgs<T> = T extends ITypedRoute<any, any, infer TArgs> ? TArgs : never;

/** Creates a typed route object. */
export function createRoute(): ITypedRoute<{}, [], string> {
    return {
        template: '',
        parameters: undefined as any,
        fill: () => '',
        args: '',
    };
}

/**
 * Defers execution of filling in the values of route parameters.
 * @param routeArgs The route's args.
 */
function makeArgs<R extends ArgsType>(routeArgs: R): any {
    if (typeof routeArgs === 'string') {
        return (arg: any) => arg !== undefined
            ? `${routeArgs}/${arg}`
            : routeArgs;
    } else {
        return (arg: any) => {
            if (arg !== undefined) {
                const nestedArgs = (routeArgs as (x: any) => any)(arg);
                return makeArgs(nestedArgs);
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
    return <R extends ITypedRoute<{}, any[], ArgsType> = ITypedRoute<{}, [], ArgsType>>
        (route: R): ITypedRoute<
            ExtractParams<R>,
            ExtractFillParams<R>,
            ExtractArgs<R>
        > => {
        // For segments, `makeArgs` is not necessary as it can expand right away.
        return {
            template: `${route.template}/${segment}`,
            parameters: undefined as any,
            fill: (...rest: Parameters<typeof route.fill>) => `${route.fill(...rest)}/${segment}`,
            args: (typeof route.args === 'string'
                ? `${route.args}/${segment}`
                : (arg: any) => `${(route.args as (arg: any) => any)(arg)}/${segment}`
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
    return <R extends ITypedRoute<{}, any[], ArgsType> = ITypedRoute<{}, [], ArgsType>>
        (route: R): ITypedRoute<
            ExtractParams<R> & P,
            Parameters<(param: P[typeof name], ...params: ExtractFillParams<R>) => string>,
            ArgsExpander<ExtractArgs<R>, P[typeof name]>
        > => {
        return {
            template: `${route.template}/:${name}`,
            parameters: undefined as any,
            fill: (param: P[typeof name], ...params: Parameters<typeof route.fill>) => `${route.fill(...params)}/${param}`,
            args: makeArgs(route.args),
        };
    };
}

/**
 * Adds an optional parameter to the typed route object.
 * @param name The name of the optional parameter to add.
 * @returns A function accepting a typed route object, returning a new typed route object with the optional parameter added.
 */
export function addOptionalParameter<P extends object = any>(name: keyof P) {
    return <R extends ITypedRoute<{}, any[], ArgsType> = ITypedRoute<{}, [], ArgsType>>
        (route: R): ITypedRoute<
            ExtractParams<R> & Partial<P>,
            Parameters<(param?: P[typeof name], ...params: ExtractFillParams<R>) => string>,
            ArgsExpander<ExtractArgs<R>, P[typeof name] | undefined>
        > => {
        return {
            template: `${route.template}/:${name}?`,
            parameters: undefined as any,
            fill: (param?: P[typeof name], ...params: Parameters<typeof route.fill>) => param !== undefined ? `${route.fill(...params)}/${param}` : route.fill(...params),
            args: makeArgs(route.args),
        };
    };
}

/** A builder class for typed routes. */
export class TypedRouteBuilder<TParams extends {} = {}, TFillParams extends any[] = [], TArgs extends ArgsType = string> {
    private _typedRoute: ITypedRoute<TParams, TFillParams, TArgs>;

    /** Initializes a new instance of the {@see TypedRouteBuilder} class. */
    constructor(typedRoute?: ITypedRoute<TParams, TFillParams, TArgs>) {
        this._typedRoute = typedRoute || createRoute() as any;
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
            ExtractBuilderParams<this> & P,
            Parameters<(param: P[typeof name], ...params: ExtractBuilderFillParams<this>) => string>,
            ArgsExpander<ExtractBuilderArgs<this>, P[typeof name]>
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
            ExtractBuilderParams<this> & Partial<P>,
            Parameters<(param?: P[typeof name], ...params: ExtractBuilderFillParams<this>) => string>,
            ArgsExpander<ExtractBuilderArgs<this>, P[typeof name] | undefined>
        > = name => {
            this._typedRoute = addOptionalParameter(name)(this._typedRoute as any) as any;
            return this as any;
        }

    /** Gets the typed route instance. */
    public typedRoute() {
        return this._typedRoute;
    }
}
type ExtractBuilderParams<T> = T extends TypedRouteBuilder<infer TParams, any, any> ? TParams : never;
type ExtractBuilderFillParams<T> = T extends TypedRouteBuilder<any, infer TFillParams, any> ? TFillParams : never;
type ExtractBuilderArgs<T> = T extends TypedRouteBuilder<any, any, infer TArgs> ? TArgs : never;
