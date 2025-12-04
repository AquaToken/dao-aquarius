// A TRUE empty-object type: `keyof` is `never` (unlike `{}` or `Record<string, never>`).
// Used to detect "no route params" at type level.
type EmptyParams = Record<never, never>;

/**
 * Extracts route params from templates like:
 *  - ":id"                  -> { id: string }
 *  - "proposal/:id/:v?"     -> { id: string; v?: string }
 *  - ""                     -> {}
 *
 * Supports optional params via `:name?`.
 */
type ExtractRouteParams<Path extends string> = Path extends `${string}:${infer Rest}`
    ? Rest extends `${infer Param}/${infer Tail}`
        ? (Param extends `${infer Name}?` ? { [K in Name]?: string } : { [K in Param]: string }) &
              ExtractRouteParams<Tail>
        : Rest extends `${infer ParamEnd}`
        ? ParamEnd extends `${infer Name}?`
            ? { [K in Name]?: string }
            : { [K in ParamEnd]: string }
        : EmptyParams
    : EmptyParams;

// Checks "does this type have any keys?"
type IsNeverKeyof<T> = keyof T extends never ? true : false;

/**
 * Builds the type for `to.*`:
 *  - If route has no params -> () => string
 *  - If route has params    -> (params) => string
 */
type ToBuilders<T extends Record<string, string>> = {
    [K in keyof T]: IsNeverKeyof<ExtractRouteParams<T[K]>> extends true
        ? () => string
        : (params: ExtractRouteParams<T[K]>) => string;
};

// Joins base + segment into an absolute URL.
// Convention: base like "/pools/", segment like "create-pool" or ":poolId".
function joinAbsolute(base: string, segment: string) {
    if (segment === '') return base;
    if (segment.startsWith(':')) return `${base}${segment}`;
    return `${base}${segment.replace(/^\//, '')}`;
}

// Parent routes that render descendant <Routes> must have a wildcard (React Router v7).
function toParentRoute(base: string) {
    return base.endsWith('/') ? `${base}*` : `${base}/*`;
}

// Replaces `:param` and `:param?` placeholders; strips any unused optional segments.
function buildUrl(template: string, params?: Record<string, string | undefined>) {
    let url = template;

    if (params) {
        for (const [paramName, value] of Object.entries(params)) {
            if (value == null) continue;
            url = url.replace(`:${paramName}?`, value).replace(`:${paramName}`, value);
        }
    }

    // Example: "/proposal/1/:version?" -> "/proposal/1"
    url = url.replace(/\/:\w+\?/g, '');
    return url;
}

/**
 * Creates a "route group" with:
 *  - base: absolute section root (e.g. "/pools/")
 *  - parentRoute: base + wildcard for mounting nested routes (e.g. "/pools/*")
 *  - child: relative paths for nested <Routes> (e.g. "create-pool", ":poolId")
 *  - link: absolute paths for links/navigation
 *  - to: typed URL builders (to.pool({ poolId }))
 */
export function createNestedRoutes<const T extends Record<string, string>>(base: string, child: T) {
    // Absolute paths for links/navigation (<Link to>, <Navigate to>, navigate()).
    const link = Object.fromEntries(
        Object.entries(child).map(([key, val]) => [key, joinAbsolute(base, val)]),
    ) as { [K in keyof T]: string };

    // Typed URL builders; compile-time enforces params based on the template.
    const to = Object.fromEntries(
        (Object.keys(child) as Array<keyof T>).map(key => {
            const template = link[key];
            return [key, (params?: Record<string, string>) => buildUrl(template, params)] as const;
        }),
    ) as unknown as ToBuilders<T>;

    return {
        base,
        parentRoute: toParentRoute(base),
        child,
        link,
        to,
    };
}
