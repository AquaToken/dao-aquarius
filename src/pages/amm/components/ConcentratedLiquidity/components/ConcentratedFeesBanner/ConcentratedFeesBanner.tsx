import * as React from 'react';
import styled from 'styled-components';

import { MINUTE } from 'constants/intervals';

import { formatBalance } from 'helpers/format-number';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import { PoolExtended } from 'types/amm';

import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';

import { commonMaxWidth, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

import { useConcentratedFeesSummary } from '../../hooks/useConcentratedFeesSummary';

const Section = styled.section`
    ${commonMaxWidth};
    width: 100%;
    padding: 2.8rem 4rem 0;
    padding-right: calc(10vw + 20rem);

    ${respondDown(Breakpoints.xxxl)`
        padding-right: calc(10vw + 30rem);
    `}

    ${respondDown(Breakpoints.xxl)`
        padding-right: calc(10vw + 40rem);
    `}

    ${respondDown(Breakpoints.lg)`
        padding: 3.2rem 1.6rem 0;
    `}
`;

const Card = styled.div`
    ${flexRowSpaceBetween};
    align-items: center;
    gap: 2.4rem;
    padding: 3.2rem;
    background: ${COLORS.white};
    border-radius: 0.6rem;

    ${respondDown(Breakpoints.md)`
        align-items: flex-start;
        flex-direction: column;
    `}
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    min-width: 0;
`;

const Title = styled.p`
    ${FONT_SIZE.md};
    color: ${COLORS.textTertiary};
`;

const FeesRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 2.4rem;
    align-items: center;
`;

const FeeItem = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
`;

const FeeValue = styled.span`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
    white-space: nowrap;
`;

const ClaimButton = styled(Button)`
    min-width: 16rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const ConcentratedFeesBanner = ({ pool }: { pool: PoolExtended }) => {
    const updateIndex = useUpdateIndex(5 * MINUTE);
    const { account, allFees, hasAnyFees, claimAllFees, pending } = useConcentratedFeesSummary(
        pool,
        {
            reloadKey: updateIndex,
            showErrors: false,
        },
    );

    if (!account || !hasAnyFees) {
        return null;
    }

    return (
        <Section>
            <Card>
                <Content>
                    <Title>You have accumulated fees</Title>
                    <FeesRow>
                        {pool.tokens.map((asset, index) => (
                            <FeeItem key={asset.contract}>
                                <AssetLogo asset={asset} isSmall isCircle />
                                <FeeValue>
                                    {formatBalance(
                                        allFees[index] || '0',
                                        true,
                                        false,
                                        asset.decimal,
                                    )}{' '}
                                    {asset.code}
                                </FeeValue>
                            </FeeItem>
                        ))}
                    </FeesRow>
                </Content>
                <ClaimButton onClick={() => claimAllFees()} pending={pending}>
                    Claim
                </ClaimButton>
            </Card>
        </Section>
    );
};

export default ConcentratedFeesBanner;
