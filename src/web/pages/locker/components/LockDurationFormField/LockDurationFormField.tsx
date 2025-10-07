import * as React from 'react';

import { Container } from './LockDurationFormField.styled';
import { LockPercentSlider } from './LockPercentSlider/LockPercentSlider';
import { LockPeriodPicker } from './LockPeriodPicker/LockPeriodPicker';

interface Props {
    lockPercent: number;
    onLockPercentChange: (percent: number) => void;
    lockPeriod: number;
    onLockPeriodChange: (duration: number) => void;
}

export const LockDurationFormField: React.FC<Props> = ({
    lockPercent,
    onLockPercentChange,
    lockPeriod,
    onLockPeriodChange,
}) => (
    <Container>
        <LockPeriodPicker lockPeriod={lockPeriod} onChange={onLockPeriodChange} />
        <LockPercentSlider
            lockPercent={lockPercent}
            onChange={onLockPercentChange}
            lockPeriod={lockPeriod}
        />
    </Container>
);

export default LockDurationFormField;
