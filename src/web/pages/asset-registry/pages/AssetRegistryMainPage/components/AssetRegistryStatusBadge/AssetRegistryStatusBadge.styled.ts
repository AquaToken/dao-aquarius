import styled from 'styled-components';

import { COLORS, FONT_SIZE } from 'styles/style-constants';

import { AssetRegistryBadgeVariant } from '../../AssetRegistryMainPage.types';

const getVariantStyles = (variant: AssetRegistryBadgeVariant) => {
    switch (variant) {
        case AssetRegistryBadgeVariant.whitelisted:
        case AssetRegistryBadgeVariant.accepted:
            return {
                background: COLORS.green50,
                color: COLORS.green900,
            };
        case AssetRegistryBadgeVariant.revoked:
        case AssetRegistryBadgeVariant.rejected:
            return {
                background: COLORS.red50,
                color: COLORS.red700,
            };
        case AssetRegistryBadgeVariant.noQuorum:
        default:
            return {
                background: COLORS.gray100,
                color: COLORS.textGray,
            };
    }
};

export const Badge = styled.div<{ $variant: AssetRegistryBadgeVariant; $withIcon: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({ $withIcon }) => ($withIcon ? '0.4rem' : '0')};
    min-height: ${({ $withIcon }) => ($withIcon ? '3.2rem' : '2.4rem')};
    padding: ${({ $withIcon }) => ($withIcon ? '0.2rem 0.8rem 0.2rem 0.6rem' : '0.2rem 0.8rem')};
    border-radius: 3.7rem;
    white-space: nowrap;
    background: ${({ $variant }) => getVariantStyles($variant).background};
    color: ${({ $variant }) => getVariantStyles($variant).color};

    ${({ $withIcon }) =>
        !$withIcon &&
        `
            ${FONT_SIZE.xs};
            font-weight: 700;
            text-transform: uppercase;
        `}
`;

export const BadgeIcon = styled.div<{ $color: string }>`
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
    color: ${({ $color }) => $color};

    svg {
        width: 1.6rem;
        height: 1.6rem;
        display: block;
    }
`;

export const BadgeContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    line-height: 0;
`;

export const BadgeCaption = styled.div`
    font-size: 1rem;
    line-height: 1rem;
    font-weight: 500;
`;

export const BadgeLabel = styled.div`
    font-size: 1.2rem;
    line-height: 1.2rem;
    font-weight: 700;
    text-transform: uppercase;
`;
