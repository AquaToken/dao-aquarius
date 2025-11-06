// Support imports
declare module '*.jpg' {
    const url: string;
    // noinspection all
    export default url;
}
declare module '*.png' {
    const url: string;
    // noinspection all
    export default url;
}
declare module '*.gif' {
    const url: string;
    // noinspection all
    export default url;
}
declare module '*.woff2' {
    const url: string;
    // noinspection all
    export default url;
}

declare module '*.css' {
    const css: string;
    // noinspection all
    export default css;
}
declare module '*.svg' {
    import * as React from 'react';

    const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}
