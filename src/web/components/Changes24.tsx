import { useMemo } from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { ExpertAssetData } from 'types/api-stellar-expert';

import IconNegative from 'assets/icons/arrows/arrow-negative-16.svg';
import IconPositive from 'assets/icons/arrows/arrow-positive-16.svg';

import { COLORS } from 'styles/style-constants';

const Changes = styled.span<{ $isPositive?: boolean; $withWrapper?: boolean }>`
    display: flex;
    align-items: center;
    color: ${({ $isPositive, $withWrapper }) => {
        if ($withWrapper) {
            return COLORS.white;
        }
        return $isPositive ? COLORS.green500 : COLORS.red500;
    }}!important;
    white-space: nowrap;
    background: ${({ $isPositive, $withWrapper }) => {
        if ($withWrapper) {
            return $isPositive ? COLORS.green500 : COLORS.red500;
        }
        return 'unset';
    }}!important;

    border-radius: ${({ $withWrapper }) => ($withWrapper ? '5rem' : 'unset')};
    padding: ${({ $withWrapper }) => ($withWrapper ? '0.4rem 0.8rem' : '0')};
    font-weight: ${({ $withWrapper }) => ($withWrapper ? 700 : 400)};

    svg {
        margin-right: ${({ $withWrapper }) => ($withWrapper ? 0 : '0.4rem')};

        path {
            fill: ${({ $withWrapper }) => ($withWrapper ? COLORS.white : 'default')};
        }
    }
`;

const Default = styled.span<{ $withWrapper: boolean }>`
    color: ${({ $withWrapper }) => {
        if ($withWrapper) {
            return COLORS.white;
        }
        return 'unset';
    }}!important;
    border-radius: ${({ $withWrapper }) => ($withWrapper ? '5rem' : 'unset')};
    font-weight: ${({ $withWrapper }) => ($withWrapper ? 700 : 400)};
    padding: ${({ $withWrapper }) => ($withWrapper ? '0.4rem 0.8rem' : '0')};
    background: ${({ $withWrapper }) => {
        if ($withWrapper) {
            return COLORS.gray100;
        }
        return 'unset';
    }}!important;
`;

interface Props {
    expertData?: ExpertAssetData;
    changes24h?: string;
    withWrapper?: boolean;
}

const Changes24 = ({ expertData, changes24h, withWrapper }: Props): JSX.Element => {
    const { change24hString, lastPrice, prevPrice } = useMemo(() => {
        if (!expertData) {
            return { change24hString: 0, lastPrice: 0, prevPrice: 0 };
        }
        const lastPrice = expertData?.price7d?.[expertData.price7d?.length - 1]?.[1] ?? 0;
        const prevPrice = expertData?.price7d?.[expertData.price7d?.length - 2]?.[1] ?? 0;
        const change24hString = formatBalance(
            +((lastPrice / prevPrice - 1) * 100).toFixed(2),
            true,
        );
        return { change24hString, lastPrice, prevPrice };
    }, [expertData]);

    if ((!prevPrice || !lastPrice) && !changes24h) {
        return <Default $withWrapper={withWrapper}>-</Default>;
    }

    if (!Number(change24hString) && !changes24h) {
        return <Default $withWrapper={withWrapper}>0.00 %</Default>;
    }

    return (
        <Changes $isPositive={Number(change24hString || changes24h) > 0} $withWrapper={withWrapper}>
            {Number(change24hString || changes24h) > 0 ? <IconPositive /> : <IconNegative />}
            {Math.abs(Number(change24hString || changes24h))} %
        </Changes>
    );
};

export default Changes24;
