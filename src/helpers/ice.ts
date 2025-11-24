import {
    D_ICE_CODE,
    DOWN_ICE_CODE,
    GD_ICE_CODE,
    GOV_ICE_CODE,
    ICE_CODE,
    ICE_ISSUER,
    UP_ICE_CODE,
} from 'constants/assets';
import { MAX_X_UPVOTE_ICE_BOOST } from 'constants/ice';

import { ClassicToken } from 'types/token';

export const getIceMaxApy = ({
    apy,
    inPercent = true,
}: {
    apy: number;
    inPercent?: boolean;
}): number => (inPercent ? apy * 100 * MAX_X_UPVOTE_ICE_BOOST : apy * MAX_X_UPVOTE_ICE_BOOST);

export const getIceApproveEndpoint = (asset: ClassicToken): string => {
    if (asset.code === ICE_CODE && asset.issuer === ICE_ISSUER) {
        return 'https://ice-approval.aqua.network/api/v1/ice/tx-approve/';
    }
    if (asset.code === UP_ICE_CODE && asset.issuer === ICE_ISSUER) {
        return 'https://ice-approval.aqua.network/api/v2/upvote-ice/tx-approve/';
    }
    if (asset.code === D_ICE_CODE && asset.issuer === ICE_ISSUER) {
        return 'https://ice-approval.aqua.network/api/v2/delegated-ice/tx-approve/';
    }
    if (asset.code === DOWN_ICE_CODE && asset.issuer === ICE_ISSUER) {
        return 'https://ice-approval.aqua.network/api/v2/downvote-ice/tx-approve/';
    }
    if (asset.code === GOV_ICE_CODE && asset.issuer === ICE_ISSUER) {
        return 'https://ice-approval.aqua.network/api/v2/govern-ice/tx-approve/';
    }

    if (asset.code === GD_ICE_CODE && asset.issuer === ICE_ISSUER) {
        return 'https://ice-approval.aqua.network/api/v2/delegated-govern-ice/tx-approve/';
    }

    throw new Error('Unknown asset');
};
