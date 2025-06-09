import * as React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { Delegatee as DelegateeType, MyDelegatees } from 'types/delegate';

import { flexColumn, respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import Delegatee from 'pages/delegate/Delegatee/Delegatee';
import DelegateeStats from 'pages/delegate/DelegateeStats/DelegateeStats';

export const List = styled.div`
    ${flexColumn};
    width: 60%;

    ${respondDown(Breakpoints.lg)`
        width: 100%;
    `}
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
                        i === selected && (
                            <DelegateeStats
                                popupVisible={popupVisible}
                                fromTop={fromTop}
                                ref={popupRef}
                                delegatee={delegatee}
                                delegatees={delegatees}
                            />
                        )
                    }
                />
            ))}
        </List>
    );
};

export default DelegatesList;
