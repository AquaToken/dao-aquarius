import * as React from 'react';
import { useEffect } from 'react';

interface Props {
    title: string;
    children: React.ReactNode;
}

const Page = ({ title, children }: Props): React.ReactNode => {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return <>{children}</>;
};

export default Page;
