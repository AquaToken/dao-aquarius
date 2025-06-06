import * as React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { Delegatee as DelegateeType } from 'types/delegate';

import { flexColumn, respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import Delegatee from 'pages/delegate/Delegatee/Delegatee';
import DelegateeStats from 'pages/delegate/DelegateeStats/DelegateeStats';

export const List = styled.div`
    ${flexColumn};
    width: 60%;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

interface Props {
    delegatees: DelegateeType[];
    myDelegatees?: Map<string, number>;
}

const DelegatesList = ({ delegatees, myDelegatees }: Props) => {
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

    if (myDelegatees) {
        return (
            <List ref={listRef}>
                {[...myDelegatees].map(([destination, total], i) => {
                    const delegatee = delegatees.find(({ account }) => account === destination);

                    return (
                        <Delegatee
                            key={destination}
                            delegatee={delegatee ?? { account: destination }}
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
                                        delegatee={delegatee ?? { account: destination }}
                                        delegatees={delegatees}
                                        withClaim={Boolean(myDelegatees)}
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
