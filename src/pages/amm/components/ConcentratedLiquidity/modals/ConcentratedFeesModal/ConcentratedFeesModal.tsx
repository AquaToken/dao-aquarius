import * as React from 'react';
import { formatBalance } from 'helpers/format-number';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';

import Alert from 'basics/Alert';
import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import PageLoader from 'basics/loaders/PageLoader';
import { ModalDescription, ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';

import {
    Container,
    PositionTokenRow,
    PositionTokenRows,
    Section,
} from '../../components/ConcentratedPositionsSection/ConcentratedPositionsSection.styled';
import { useConcentratedFeesSummary } from '../../hooks/useConcentratedFeesSummary';

type ConcentratedFeesModalParams = {
    pool: PoolExtended;
};

const ConcentratedFeesModal = ({
    close,
    params,
}: ModalProps<ConcentratedFeesModalParams>): React.ReactNode => {
    const { pool } = params;
    const { account, allFees, positionsCount, pending, loading, hasAnyFees, claimAllFees } =
        useConcentratedFeesSummary(pool);

    const title = 'Concentrated Fees';

    return (
        <ModalWrapper>
            <ModalTitle>{title}</ModalTitle>
            <Container>
                {!account && <Alert title="Wallet required" text="Connect wallet to claim fees." />}

                {loading ? (
                    <PageLoader />
                ) : (
                    <Section>
                        {hasAnyFees ? (
                            <>
                                <ModalDescription>
                                    You have accumulated fees across {positionsCount} position
                                    {positionsCount === 1 ? '' : 's'}.
                                </ModalDescription>
                                <PositionTokenRows>
                                    {pool.tokens.map((asset, index) => (
                                        <PositionTokenRow key={asset.contract}>
                                            <span>{asset.code}</span>
                                            <span>
                                                {formatBalance(
                                                    Number(allFees[index] || 0),
                                                    true,
                                                    false,
                                                    asset.decimal,
                                                )}
                                                <AssetLogo asset={asset} isSmall isCircle />
                                            </span>
                                        </PositionTokenRow>
                                    ))}
                                </PositionTokenRows>
                            </>
                        ) : (
                            <>
                                <ModalDescription>
                                    No claimable fees yet. Fees will appear here after swaps in your
                                    active ranges.
                                </ModalDescription>
                                <PositionTokenRows>
                                    {pool.tokens.map(asset => (
                                        <PositionTokenRow key={asset.contract}>
                                            <span>{asset.code}</span>
                                            <span>
                                                0
                                                <AssetLogo asset={asset} isSmall isCircle />
                                            </span>
                                        </PositionTokenRow>
                                    ))}
                                </PositionTokenRows>
                            </>
                        )}
                    </Section>
                )}

                <StickyButtonWrapper>
                    <Button
                        fullWidth
                        isBig
                        onClick={() => {
                            if (hasAnyFees) {
                                claimAllFees({ onSuccess: close });
                                return;
                            }
                            close();
                        }}
                        pending={pending}
                        disabled={hasAnyFees ? !account : false}
                    >
                        {hasAnyFees ? 'Claim all fees' : 'Got it'}
                    </Button>
                </StickyButtonWrapper>
            </Container>
        </ModalWrapper>
    );
};

export default ConcentratedFeesModal;
