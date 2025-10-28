import styled from 'styled-components';

import IceSymbol from 'assets/icons/small-icons/icon-ice-symbol-10.svg';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const IceSymbolWhite = styled(IceSymbol)`
    path {
        fill: ${COLORS.white};
    }
`;

const BoostLogo = styled.div`
    ${flexAllCenter};
    width: 1.5rem;
    height: 1.5rem;
    background-color: ${COLORS.blue700};
    border-radius: 0.4rem;
`;

export const IconBoost = () => (
    <BoostLogo>
        <IceSymbolWhite />
    </BoostLogo>
);
