import * as React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { Delegatee as DelegateeType, MyDelegatees } from 'types/delegate';

import {
    cardBoxShadow,
    flexAllCenter,
    flexColumn,
    flexColumnCenter,
    respondDown,
} from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Profile from 'assets/icon-profile.svg';

import { Button } from 'basics/buttons';

import Delegatee from 'pages/delegate/Delegatee/Delegatee';
import DelegateeStats from 'pages/delegate/DelegateeStats/DelegateeStats';

import ChooseLoginMethodModal from '../../../web/modals/auth/ChooseLoginMethodModal';
import DelegateModal from '../../../web/modals/DelegateModal';

export const List = styled.div`
    ${flexColumn};
    width: 60%;

    ${respondDown(Breakpoints.lg)`
        width: 100%;
    `}
`;

const Empty = styled.div`
    position: absolute;
    left: calc(100% + 4rem);
    top: 0;
    background-color: ${COLORS.white};
    ${cardBoxShadow};
    ${flexColumnCenter};
    width: 50%;
    border-radius: 2.4rem;
    padding: 2.4rem;
    gap: 2.4rem;

    span {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.descriptionText};
    }

    ${respondDown(Breakpoints.lg)`
        display: none;
    `}
`;

const ButtonMobile = styled(Button)`
    display: none;
    margin-bottom: 2.4rem;

    ${respondDown(Breakpoints.lg)`
        display: flex;
    `}
`;

const IconWrap = styled.div`
    ${flexAllCenter};
    height: 6.4rem;
    width: 6.4rem;
    border-radius: 50%;
    background-color: ${COLORS.lightGray};
`;

interface Props {
    delegatees: DelegateeType[];
    myLocks?: Map<string, number>;
    customDelegatees?: MyDelegatees[];
}

const DelegatesList = ({ delegatees, myLocks, customDelegatees }: Props) => {
    const [selected, setSelected] = useState<number | null>(null);
    const [fromTop, setFromTop] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);

    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const popupRef = useRef<HTMLDivElement>(null);

    const { isLogged } = useAuthStore();

    useLayoutEffect(() => {
        if (selected === null) return;

        setPopupVisible(false);

        requestAnimationFrame(() => {
            const listRect = listRef.current?.getBoundingClientRect();
            const itemRect = itemRefs.current[selected]?.getBoundingClientRect();
            const popupRect = popupRef.current?.getBoundingClientRect();

            if (listRect && itemRect) {
                const spaceAbove = itemRect.bottom - listRect.top;
                const spaceBelow = listRect.bottom - itemRect.top;

                if (spaceBelow >= popupRect.height) {
                    setFromTop(true);
                } else if (spaceAbove >= popupRect.height) {
                    setFromTop(false);
                } else {
                    setFromTop(true);
                }

                setPopupVisible(true);
            }
        });
    }, [selected]);

    if (myLocks) {
        return (
            <List ref={listRef}>
                {[...myLocks].map(([destination, total], i) => {
                    const knownDelegatee = delegatees.find(
                        ({ account }) => account === destination,
                    );
                    const customDelegatee = customDelegatees.find(
                        ({ account }) => account === destination,
                    );

                    return (
                        <Delegatee
                            key={destination}
                            delegatee={knownDelegatee ?? customDelegatee}
                            myDelegation={total}
                            ref={el => (itemRefs.current[i] = el)}
                            isSelected={i === selected}
                            onDelegateClick={() => {
                                setSelected(i);
                            }}
                            statsBlock={
                                i === selected && (
                                    <DelegateeStats
                                        popupVisible={popupVisible}
                                        fromTop={fromTop}
                                        ref={popupRef}
                                        delegatee={knownDelegatee ?? customDelegatee}
                                        delegatees={delegatees}
                                        withClaim={Boolean(myLocks)}
                                    />
                                )
                            }
                        />
                    );
                })}
            </List>
        );
    }

    return (
        <List ref={listRef}>
            <ButtonMobile
                isBig
                fullWidth
                isRounded
                onClick={() => {
                    if (!isLogged) {
                        return ModalService.openModal(ChooseLoginMethodModal, {
                            callback: () =>
                                ModalService.openModal(DelegateModal, {
                                    delegatees,
                                }),
                        });
                    }
                    ModalService.openModal(DelegateModal, { delegatees });
                }}
            >
                Delegate ICE
            </ButtonMobile>
            {delegatees.map((delegatee, i) => (
                <Delegatee
                    key={delegatee.account}
                    delegatee={delegatee}
                    ref={el => (itemRefs.current[i] = el)}
                    isSelected={i === selected}
                    onDelegateClick={() => {
                        setSelected(i);
                    }}
                    statsBlock={
                        selected === null && i === 0 ? (
                            <Empty onClick={e => e.stopPropagation()}>
                                <IconWrap>
                                    <Profile />
                                </IconWrap>
                                <span>Select a delegate to see the details</span>
                                <Button
                                    isBig
                                    fullWidth
                                    isRounded
                                    onClick={() => {
                                        if (!isLogged) {
                                            return ModalService.openModal(ChooseLoginMethodModal, {
                                                callback: () =>
                                                    ModalService.openModal(DelegateModal, {
                                                        delegatees,
                                                    }),
                                            });
                                        }
                                        ModalService.openModal(DelegateModal, { delegatees });
                                    }}
                                >
                                    Delegate ICE
                                </Button>
                            </Empty>
                        ) : (
                            i === selected && (
                                <DelegateeStats
                                    popupVisible={popupVisible}
                                    fromTop={fromTop}
                                    ref={popupRef}
                                    delegatee={delegatee}
                                    delegatees={delegatees}
                                />
                            )
                        )
                    }
                />
            ))}
        </List>
    );
};

export default DelegatesList;
