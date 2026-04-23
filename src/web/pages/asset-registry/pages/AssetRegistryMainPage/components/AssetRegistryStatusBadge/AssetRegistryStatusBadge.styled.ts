import styled from 'styled-components';

import { AssetRegistryBadgeVariant } from '../../AssetRegistryMainPage.types';

import { COLORS, FONT_SIZE, hexWithOpacity } from 'styles/style-constants';

const getVariantStyles = (variant: AssetRegistryBadgeVariant) => {
    switch (variant) {
        case AssetRegistryBadgeVariant.whitelisted:
        case AssetRegistryBadgeVariant.accepted:
            return {
                background: '#CCFADF',
                color: '#002600',
            };
        case AssetRegistryBadgeVariant.revoked:
        case AssetRegistryBadgeVariant.rejected:
            return {
                background: '#FFE8ED',
                color: '#AB0D0D',
            };
        case AssetRegistryBadgeVariant.inVoting:
            return {
                background: hexWithOpacity(COLORS.purple500, 14),
                color: COLORS.purple500,
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
    ${FONT_SIZE.xs};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({ $withIcon }) => ($withIcon ? '0.4rem' : '0')};
    min-height: 2.4rem;
    padding: ${({ $withIcon }) => ($withIcon ? '0.2rem 0.8rem 0.2rem 0.6rem' : '0.2rem 0.8rem')};
    border-radius: 3.7rem;
    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;
    background: ${({ $variant }) => getVariantStyles($variant).background};
    color: ${({ $variant }) => getVariantStyles($variant).color};
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
