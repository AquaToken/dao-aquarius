import * as React from 'react';
import { forwardRef, RefObject } from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';
import { truncateString } from 'helpers/truncate-string';

import { Delegatee as DelegateeType } from 'types/delegate';

import { cardBoxShadow, respondDown, respondUp } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Arrow from 'assets/icon-arrow-down.svg';

import Identicon from 'basics/Identicon';

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
    `}
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
    margin-top: 2.4rem;
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
    ) => (
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
                    </h3>

                    {myDelegation ? (
                        <span>
                            My delegation: <b>{formatBalance(myDelegation, true)} ICE</b>
                        </span>
                    ) : (
                        <span>
                            Managed: <b>{formatBalance(Number(delegatee.managed_ice), true)} ICE</b>
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
                        Managed: <b>{formatBalance(Number(delegatee.managed_ice), true)} ICE</b>
                    </MobileAmount>
                )}

                {delegatee.description && <Bio>{delegatee.description}</Bio>}

                {+delegatee.delegated > 0 && (
                    <Trusted>
                        Trusted by <b>{formatBalance(+delegatee.delegated)}</b> account
                        {+delegatee.delegated > 1 ? 's' : ''}
                    </Trusted>
                )}
            </Main>
            {statsBlock}
        </Container>
    ),
);

Delegatee.displayName = 'Delegatee';

export default Delegatee;
