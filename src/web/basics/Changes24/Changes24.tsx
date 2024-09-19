import { useMemo } from 'react';
import styled from 'styled-components';

import { ExpertAssetData } from 'types/api-stellar-expert';

import { COLORS } from 'web/styles';

import IconNegative from 'assets/icons/icon-arrow-negative-16.svg';
import IconPositive from 'assets/icons/icon-arrow-positive-16.svg';

import { formatBalance } from '../../../common/helpers/helpers';

const Changes = styled.span<{ isPositive?: boolean }>`
    display: flex;
    align-items: center;
    color: ${({ isPositive }) => (isPositive ? COLORS.green : COLORS.pinkRed)}!important;

    svg {
        margin-right: 0.4rem;
    }
`;

interface Props {
    expertData: ExpertAssetData;
}

const Changes24 = ({ expertData }: Props): JSX.Element => {
    const { change24hString, lastPrice, prevPrice } = useMemo(() => {
        const lastPrice = expertData?.price7d?.[expertData.price7d?.length - 1]?.[1] ?? 0;
        const prevPrice = expertData?.price7d?.[expertData.price7d?.length - 2]?.[1] ?? 0;
        const change24hString = formatBalance((lastPrice / prevPrice - 1) * 100, true);
        return { change24hString, lastPrice, prevPrice };
    }, [expertData]);

    if (!prevPrice || !lastPrice) {
        return <span>-</span>;
    }

    if (!Number(change24hString)) {
        return <span>0.00</span>;
    }

    return (
        <Changes isPositive={Number(change24hString) > 0}>
            {Number(change24hString) > 0 ? <IconPositive /> : <IconNegative />}
            {Math.abs(Number(change24hString))} %
        </Changes>
    );
};

export default Changes24;
