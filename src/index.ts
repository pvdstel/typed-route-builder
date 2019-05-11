/** An interface representing a typed route. */
export interface ITypedRoute<TParams extends {}, TFillParams extends any[]> {
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
}
type ExtractParams<T> = T extends ITypedRoute<infer TParams, any> ? TParams : never;
type ExtractFillParams<T> = T extends ITypedRoute<any, infer TFillParams> ? TFillParams : never;

/** Creates a typed route object. */
export function createRoute(): ITypedRoute<{}, []> {
    return {
        template: '',
        parameters: undefined as any,
        fill: () => '',
    };
}

/**
 * Adds a segment to the typed route object.
 * @param segment The segment to add.
 * @returns A function accepting a typed route object, returning a new typed route object with segment added.
 */
export function addSegment(segment: string) {
    return <R extends ITypedRoute<{}, any[]> = ITypedRoute<{}, []>>(route: R): ITypedRoute<ExtractParams<R>, ExtractFillParams<R>> => {
        return {
            template: `${route.template}/${segment}`,
            parameters: undefined as any,
            fill: (...rest: Parameters<typeof route.fill>) => `${route.fill(...rest)}/${segment}`,
        };
    };
}

/**
 * Adds a parameter to the typed route object.
 * @param name The name of the parameter to add.
 * @returns A function accepting a typed route object, returning a new typed route object with the parameter added.
 */
export function addParameter<P extends object = any>(name: keyof P) {
    return <R extends ITypedRoute<{}, any[]> = ITypedRoute<{}, []>>(route: R): ITypedRoute<ExtractParams<R> & P, Parameters<(param: P[typeof name], ...params: ExtractFillParams<R>) => string>> => {
        return {
            template: `${route.template}/:${name}`,
            parameters: undefined as any,
            fill: (param: P[typeof name], ...params: Parameters<typeof route.fill>) => `${route.fill(...params)}/${param}`,
        };
    };
}

/**
 * Adds an optional parameter to the typed route object.
 * @param name The name of the optional parameter to add.
 * @returns A function accepting a typed route object, returning a new typed route object with the optional parameter added.
 */
export function addOptionalParameter<P extends object = any>(name: keyof P) {
    return <R extends ITypedRoute<{}, any[]> = ITypedRoute<{}, []>>(route: R): ITypedRoute<ExtractParams<R> & Partial<P>, Parameters<(param?: P[typeof name], ...params: ExtractFillParams<R>) => string>> => {
        return {
            template: `${route.template}/:${name}?`,
            parameters: undefined as any,
            fill: (param?: P[typeof name], ...params: Parameters<typeof route.fill>) => param !== undefined ? `${route.fill(...params)}/${param}` : route.fill(...params),
        };
    };
}

/** A builder class for typed routes. */
export class TypedRouteBuilder<TParams extends {} = {}, TFillParams extends any[] = []> {
    private _typedRoute: ITypedRoute<TParams, TFillParams>;

    /** Initializes a new instance of the {@see TypedRouteBuilder} class. */
    constructor() {
        this._typedRoute = createRoute() as any;
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
    public parameter: <P extends object>(name: keyof P) => TypedRouteBuilder<ExtractBuilderParams<this> & P, Parameters<(param: P[typeof name], ...params: ExtractBuilderConstructParams<this>) => string>> = name => {
        this._typedRoute = addParameter(name)(this._typedRoute as any) as any;
        return this as any;
    }

    /**
     * Adds an optional to the typed route object.
     * @param name The name of the optional parameter to add.
     */
    public optionalParameter: <P extends object>(name: keyof P) => TypedRouteBuilder<ExtractBuilderParams<this> & Partial<P>, Parameters<(param?: P[typeof name], ...params: ExtractBuilderConstructParams<this>) => string>> = name => {
        this._typedRoute = addOptionalParameter(name)(this._typedRoute as any) as any;
        return this as any;
    }

    /** Gets the typed route instance. */
    public typedRoute() {
        return this._typedRoute;
    }
}
type ExtractBuilderParams<T> = T extends TypedRouteBuilder<infer TParams, any> ? TParams : never;
type ExtractBuilderConstructParams<T> = T extends TypedRouteBuilder<any, infer TFillParams> ? TFillParams : never;
