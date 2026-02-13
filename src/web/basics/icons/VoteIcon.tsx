import * as React from 'react';
import styled, { css } from 'styled-components';

import { VoteOptions } from 'constants/dao';

import Abstain from 'assets/icons/actions/icon-vote-abstain.svg';
import Fail from 'assets/icons/status/fail-red.svg';
import Success from 'assets/icons/status/success.svg';

type Size = 'small' | 'medium' | 'large';

const iconSizes: Record<Size, string> = {
    small: '1.6rem',
    medium: '2.4rem',
    large: '3.2rem',
};

const iconStyles = css<{ size: Size }>`
    height: ${({ size }) => iconSizes[size]};
    width: ${({ size }) => iconSizes[size]};
`;

const FailIcon = styled(Fail)<{ size: Size }>`
    ${iconStyles};
`;

const SuccessIcon = styled(Success)<{ size: Size }>`
    ${iconStyles};
`;

const AbstainIcon = styled(Abstain)<{ size: Size }>`
    ${iconStyles};
`;

interface Props {
    option: VoteOptions;
    size?: Size;
}

const VoteIcon = ({ option, size = 'small' }: Props) => {
    if (option === VoteOptions.for) {
        return <SuccessIcon size={size} />;
    }

    if (option === VoteOptions.against) {
        return <FailIcon size={size} />;
    }

    if (option === VoteOptions.abstain) {
        return <AbstainIcon size={size} />;
    }

    return null;
};

export default VoteIcon;
