import * as React from 'react';
import { forwardRef, RefObject } from 'react';
import styled from 'styled-components';

import { ICE_DELEGATION_MAP, ICE_TO_DELEGATE } from 'constants/assets';

import { getTrusted, getVotingPower } from 'helpers/delegate';
import { formatBalance } from 'helpers/format-number';
import { truncateString } from 'helpers/truncate-string';

import { Delegatee as DelegateeType } from 'types/delegate';

import Arrow from 'assets/icon-arrow-down.svg';

import Identicon from 'basics/Identicon';
import Label from 'basics/Label';

import { cardBoxShadow, flexRowSpaceBetween, respondDown, respondUp } from '../../../../web/mixins';
import { Breakpoints, COLORS } from '../../../../web/styles';

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
        `0.2rem solid ${$isSelected ? COLORS.purple : COLORS.transparent}`};
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
            $isSelected ? `0.1rem solid ${COLORS.lightGray}` : 'none'};
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
        color: ${COLORS.titleText};
        display: flex;
        gap: 0.8rem;
        align-items: center;

        div {
            height: fit-content;
        }
    }

    span {
        margin-left: auto;
        color: ${COLORS.grayText};
    }

    b {
        color: ${COLORS.titleText};
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
    color: ${COLORS.grayText};
    margin-bottom: 0;
`;

const Trusted = styled.span`
    color: ${COLORS.grayText};
`;

const AffiliateProject = styled.span`
    color: ${COLORS.grayText};

    b {
        color: ${COLORS.titleText};
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
    myDelegation?: number;
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
                                My delegation: <b>{formatBalance(myDelegation, true)} ICE</b>
                            </span>
                        ) : (
                            <span>
                                Voting Power: <b>{getVotingPower(delegatee)}</b>
                            </span>
                        )}

                        <ArrowIcon $isSelected={isSelected} />
                    </Header>

                    {myDelegation ? (
                        <MobileAmount>
                            My delegation: <b>{formatBalance(myDelegation, true)} ICE</b>
                        </MobileAmount>
                    ) : (
                        <MobileAmount>
                            Voting Power: <b>{getVotingPower(delegatee)}</b>
                        </MobileAmount>
                    )}

                    {delegatee.description && <Bio>{delegatee.description}</Bio>}

                    <BottomRow>
                        {Object.values(delegatee.delegated).length > 0 ? (
                            <Trusted>
                                Trusted by <b>{getTrusted(delegatee)}</b> account
                                {+delegatee.delegated > 1 ? 's' : ''}
                            </Trusted>
                        ) : (
                            <div />
                        )}
                        {Boolean(delegatee.affiliate_project) && (
                            <AffiliateProject>
                                Affiliated project(s): <b>{delegatee.affiliate_project}</b>
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
