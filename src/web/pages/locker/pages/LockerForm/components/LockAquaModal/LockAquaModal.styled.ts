import styled from 'styled-components';

import Aqua from 'assets/aqua/aqua-logo.svg';
import Ice from 'assets/tokens/ice-logo.svg';

import { flexRowSpaceBetween } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

export const Row = styled.div`
    ${flexRowSpaceBetween};
    font-size: 1.6rem;
    line-height: 1.8rem;
    padding-bottom: 3rem;
`;

export const Label = styled.span`
    color: ${COLORS.textGray};
`;

export const Value = styled.span`
    color: ${COLORS.textTertiary};
    display: flex;
    align-items: center;
`;

export const ButtonContainer = styled.div`
    padding-top: 3.2rem;
    border-top: 0.1rem dashed ${COLORS.gray100};
    display: flex;
`;

export const AquaLogo = styled(Aqua)`
    height: 2.4rem;
    width: 2.4rem;
    margin-right: 0.8rem;
`;

export const IceLogo = styled(Ice)`
    height: 2.4rem;
    width: 2.4rem;
    margin-right: 0.8rem;
`;

export const AddTrustBlock = styled.div`
    background: ${COLORS.gray50};
    border-radius: 0.5rem;
    padding: 3.5rem 3.2rem 2.2rem;
    margin-bottom: 2.4rem;
`;

export const AddTrustDescription = styled.div`
    display: flex;
    align-items: center;
    gap: 2.6rem;
    margin-bottom: 1.4rem;
`;

export const AddTrustEmoji = styled.span`
    font-size: 1.8rem;
    line-height: 3.2rem;
`;

export const AddTrustTextDescription = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
`;
