import * as React from 'react';

import { ResetButtonRoot, ResetIcon } from './ResetButton.styled';

interface Props {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    'aria-label': string;
}

const ResetButton = ({ onClick, 'aria-label': ariaLabel }: Props) => (
    <ResetButtonRoot onClick={onClick} aria-label={ariaLabel}>
        <ResetIcon />
    </ResetButtonRoot>
);

export default ResetButton;
