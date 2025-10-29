import * as React from 'react';

import { formatBalance } from 'helpers/format-number';

import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { COLORS } from 'styles/style-constants';

import {
    IceLogo,
    IceLogoSmall,
    InfoIcon,
    TooltipInner,
    TooltipRow,
    YouWillGet,
    YouWillGetAmount,
    YouWillGetLabel,
} from '../LockAquaForm.styled';

interface Props {
    iceAmount: number;
}

export const YouWillGetSection = ({ iceAmount }: Props) => (
    <YouWillGet>
        <YouWillGetLabel>You will get:</YouWillGetLabel>
        <YouWillGetAmount>
            <IceLogo />
            <Tooltip
                position={TOOLTIP_POSITION.left}
                showOnHover
                background={COLORS.white}
                content={
                    <TooltipInner>
                        <TooltipRow>
                            <span>upvoteICE:</span>
                            <span>
                                <IceLogoSmall />
                                {formatBalance(iceAmount * 0.8, true)}
                            </span>
                        </TooltipRow>
                        <TooltipRow>
                            <span>downvoteICE:</span>
                            <span>
                                <IceLogoSmall />
                                {formatBalance(iceAmount * 0.2, true)}
                            </span>
                        </TooltipRow>
                        <TooltipRow>
                            <span>governICE:</span>
                            <span>
                                <IceLogoSmall />
                                {formatBalance(iceAmount, true)}
                            </span>
                        </TooltipRow>
                    </TooltipInner>
                }
            >
                <span>
                    {formatBalance(iceAmount, true)} ICE <InfoIcon />
                </span>
            </Tooltip>
        </YouWillGetAmount>
    </YouWillGet>
);
