import * as React from 'react';

import { COLORS } from 'web/styles';

export const IconSort = ({
    isEnabled,
    isReversed,
}: {
    isEnabled: boolean;
    isReversed: boolean;
}): React.ReactNode => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M5 7L8 4L11 7"
            stroke={!isEnabled || isReversed ? COLORS.textGray : COLORS.transparent}
        />
        <path
            d="M11 9L8 12L5 9"
            stroke={!isEnabled || !isReversed ? COLORS.textGray : COLORS.transparent}
        />
    </svg>
);
