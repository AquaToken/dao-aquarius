import * as React from 'react';
import { forwardRef, RefObject } from 'react';
import styled from 'styled-components';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { truncateString } from 'helpers/truncate-string';

import { Delegatee as DelegateeType } from 'types/delegate';

import { cardBoxShadow, flexRowSpaceBetween, respondDown, respondUp } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Arrow from 'assets/icons/arrows/arrow-down-16.svg';

import Identicon from 'basics/Identicon';
import Label from 'basics/Label';

import { GOV_ICE, UP_ICE } from 'pages/vote/components/MainPage/MainPage';

const Container = styled.div<{ $isSelected: boolean }>`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    ${cardBoxShadow};
    padding: 2.4rem;
    border-radius: 2.4rem;
    margin-bottom: 2.4rem;
    cursor: pointer;
    border: ${({ $isSelected }) =>
        `0.2rem solid ${$isSelected ? COLORS.purple500 : COLORS.transparent}`};
    position: relative;

    ${respondDown(Breakpoints.lg)`
        padding: 1.6rem;
    `}
`;

const Image = styled.img`
    height: 4.8rem;
    width: 4.8rem;
    border-radius: 50%;
    margin-right: 1.6rem;
`;

const Main = styled.div<{ $isSelected: boolean }>`
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.lg)`
        flex-direction: column;
        border-bottom: ${({ $isSelected }) =>
            $isSelected ? `0.1rem solid ${COLORS.gray50}` : 'none'};
        padding-bottom: ${({ $isSelected }) => ($isSelected ? '2.4rem' : '0')};
    `}
`;

const Header = styled.div`
    display: flex;
    align-items: center;

    h3 {
        font-weight: 700;
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.textPrimary};
        display: flex;
        gap: 0.8rem;
        align-items: center;

        div {
            height: fit-content;
        }
    }

    span {
        margin-left: auto;
        color: ${COLORS.textGray};
    }

    b {
        color: ${COLORS.textPrimary};
    }

    ${respondDown(Breakpoints.lg)`
        span {
            display: none;
        }
    `};

    ${respondDown(Breakpoints.xs)`
        h3 {
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
        }
    `};
`;

const MobileAmount = styled.span`
    margin-top: 1.6rem;
    ${respondUp(Breakpoints.lg)`
        display: none;
    `}
`;

const Bio = styled.p`
    margin-top: 2.4rem;
    color: ${COLORS.textGray};
    margin-bottom: 0;
`;

const Trusted = styled.span`
    color: ${COLORS.textGray};
`;

const AffiliateProject = styled.span`
    color: ${COLORS.textGray};

    b {
        color: ${COLORS.textPrimary};
    }
`;

const ArrowIcon = styled(Arrow)<{ $isSelected: boolean }>`
    display: none;
    transform: rotate(${({ $isSelected }) => ($isSelected ? '180deg' : '0')});
    transition: transform 0.2s;
    margin-left: auto;

    ${respondDown(Breakpoints.lg)`
        display: flex;
    `}
`;

const IdenticonStyled = styled(Identicon)`
    height: 4.8rem;
    width: 4.8rem;
    margin-right: 0.8rem;
`;
const BottomRow = styled.div`
    ${flexRowSpaceBetween};
    margin-top: 2.4rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        align-items: flex-start;
        gap: 1.6rem;
    `}
`;

interface Props {
    isSelected: boolean;
    onDelegateClick: () => void;
    statsBlock: React.ReactNode;
    delegatee: Partial<DelegateeType>;
    myDelegation?: string;
}

const Delegatee = forwardRef(
    (
        { isSelected, onDelegateClick, statsBlock, delegatee, myDelegation }: Props,
        ref: RefObject<HTMLDivElement>,
    ) =>
        delegatee ? (
            <Container ref={ref} $isSelected={isSelected} onClick={onDelegateClick}>
                <Main $isSelected={isSelected}>
                    <Header>
                        {delegatee.image ? (
                            <Image src={delegatee.image} alt={delegatee.name} width={48} />
                        ) : (
                            <IdenticonStyled pubKey={delegatee.account} />
                        )}

                        <h3>
                            {delegatee.name ? delegatee.name : truncateString(delegatee.account, 4)}
                            {delegatee.is_recommended && (
                                <Label
                                    labelText="RECOMMENDED"
                                    tooltipText="Recommended by the Aquarius team based on past contributions to Aquarius or the broader Stellar ecosystem."
                                />
                            )}
                        </h3>

                        {myDelegation ? (
                            <span>
                                My delegation: <b>{myDelegation}</b>
                            </span>
                        ) : (
                            <span>
                                {!!+delegatee.managed_ice?.[getAssetString(UP_ICE)] && (
                                    <span>
                                        Market Voting Power:{' '}
                                        <b>
                                            {formatBalance(
                                                delegatee.managed_ice?.[getAssetString(UP_ICE)],
                                                true,
                                            )}{' '}
                                            dICE
                                        </b>
                                    </span>
                                )}

                                {!!+delegatee.managed_ice?.[getAssetString(GOV_ICE)] && (
                                    <>
                                        <br />
                                        <span>
                                            DAO Voting Power:{' '}
                                            <b>
                                                {formatBalance(
                                                    delegatee.managed_ice?.[
                                                        getAssetString(GOV_ICE)
                                                    ],
                                                    true,
                                                )}{' '}
                                                gdICE
                                            </b>
                                        </span>
                                    </>
                                )}
                            </span>
                        )}

                        <ArrowIcon $isSelected={isSelected} />
                    </Header>

                    {myDelegation ? (
                        <MobileAmount>
                            My delegation: <b>{myDelegation}</b>
                        </MobileAmount>
                    ) : (
                        <MobileAmount>
                            <span>
                                {!!+delegatee.managed_ice?.[getAssetString(UP_ICE)] && (
                                    <span>
                                        Market Voting Power:{' '}
                                        <b>
                                            {formatBalance(
                                                delegatee.managed_ice?.[getAssetString(UP_ICE)],
                                                true,
                                            )}{' '}
                                            dICE
                                        </b>
                                    </span>
                                )}

                                {!!+delegatee.managed_ice?.[getAssetString(GOV_ICE)] && (
                                    <>
                                        <br />
                                        <span>
                                            DAO Voting Power:{' '}
                                            <b>
                                                {formatBalance(
                                                    delegatee.managed_ice?.[
                                                        getAssetString(GOV_ICE)
                                                    ],
                                                    true,
                                                )}{' '}
                                                gdICE
                                            </b>
                                        </span>
                                    </>
                                )}
                            </span>
                        </MobileAmount>
                    )}

                    {delegatee.description && <Bio>{delegatee.description}</Bio>}

                    <BottomRow>
                        {delegatee.delegated && Object.values(delegatee.delegated).length > 0 ? (
                            <Trusted>
                                Trusted by{' '}
                                <b>
                                    {delegatee?.overall_delegated_stat?.unique_delegators ??
                                        delegatee.delegated?.[getAssetString(UP_ICE)]}
                                </b>{' '}
                                account
                                {(delegatee.delegated?.[getAssetString(UP_ICE)] ?? 0) > 1
                                    ? 's'
                                    : ''}
                            </Trusted>
                        ) : (
                            <div />
                        )}
                        {Boolean(delegatee.affiliate_project) && (
                            <AffiliateProject>
                                Affiliate Project(s): <b>{delegatee.affiliate_project}</b>
                            </AffiliateProject>
                        )}
                    </BottomRow>
                </Main>
                {statsBlock}
            </Container>
        ) : null,
);

Delegatee.displayName = 'Delegatee';

export default Delegatee;
