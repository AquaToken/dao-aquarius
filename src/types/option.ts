import * as React from 'react';

export type Option<T> = {
    label: string | React.ReactNode;
    value: T;
    icon?: React.ReactNode;
};
