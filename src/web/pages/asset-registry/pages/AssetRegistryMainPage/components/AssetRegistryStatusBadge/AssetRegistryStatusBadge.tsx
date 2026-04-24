import * as React from 'react';

import Pending16 from 'assets/icons/status/pending-16.svg';

import {
    Badge,
    BadgeCaption,
    BadgeContent,
    BadgeIcon,
    BadgeLabel,
} from './AssetRegistryStatusBadge.styled';

import { AssetRegistryBadgeVariant } from '../../AssetRegistryMainPage.types';

const getBadgeTextColor = (variant: AssetRegistryBadgeVariant) => {
    switch (variant) {
        case AssetRegistryBadgeVariant.whitelisted:
        case AssetRegistryBadgeVariant.accepted:
            return '#002600';
        case AssetRegistryBadgeVariant.revoked:
        case AssetRegistryBadgeVariant.rejected:
            return '#AB0D0D';
        default:
            return '';
    }
};

type AssetRegistryStatusBadgeProps = {
    variant: AssetRegistryBadgeVariant;
    label: string;
    withIcon?: boolean;
};

const AssetRegistryStatusBadge = ({
    variant,
    label,
    withIcon = false,
}: AssetRegistryStatusBadgeProps) => {
    const shouldShowIcon =
        withIcon &&
        (variant === AssetRegistryBadgeVariant.whitelisted ||
            variant === AssetRegistryBadgeVariant.revoked);

    return (
        <Badge $variant={variant} $withIcon={shouldShowIcon}>
            {shouldShowIcon ? (
                <>
                    <BadgeIcon $color={getBadgeTextColor(variant)}>
                        <Pending16 />
                    </BadgeIcon>
                    <BadgeContent>
                        <BadgeCaption>Request for</BadgeCaption>
                        <BadgeLabel>{label}</BadgeLabel>
                    </BadgeContent>
                </>
            ) : null}
            {!shouldShowIcon ? label : null}
        </Badge>
    );
};

export default AssetRegistryStatusBadge;
