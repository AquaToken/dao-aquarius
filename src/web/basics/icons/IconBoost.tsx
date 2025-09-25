import styled from 'styled-components';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import IceSymbol from 'assets/icon-ice-symbol.svg';

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
