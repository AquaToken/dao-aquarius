import * as React from 'react';

import FailIcon from 'assets/icons/status/fail-white-14.svg';
import SuccessIcon from 'assets/icons/status/success-white-14.svg';

import { COLORS } from 'styles/style-constants';

import { Container } from './EligibilityStatus.styled';

interface EligibilityStatusProps {
    type: 'eligible' | 'not-eligible';
}

const STATUS_CONFIG = {
    eligible: {
        bg: `linear-gradient(300.06deg, ${COLORS.purple950} -19.81%, ${COLORS.purple400} 141.52%)`,
        icon: <SuccessIcon />,
        text: 'Eligible for airdrop',
    },
    'not-eligible': {
        bg: COLORS.red500,
        icon: <FailIcon />,
        text: 'Not eligible for airdrop',
    },
};

const EligibilityStatus: React.FC<EligibilityStatusProps> = ({ type }) => {
    const { bg, icon, text } = STATUS_CONFIG[type];
    return (
        <Container $bg={bg}>
            {icon}
            {text}
        </Container>
    );
};

export default EligibilityStatus;
