import * as React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { getDelegatees } from 'api/delegate';

import { commonMaxWidth, flexColumn, respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import { PageLoader } from 'basics/loaders';

import Delegatee from 'pages/delegate/Delegatee/Delegatee';
import DelegateeStats from 'pages/delegate/DelegateeStats/DelegateeStats';

const Main = styled.main`
    flex: 1 0 auto;
`;

const Wrapper = styled.div`
    ${commonMaxWidth};
    margin: 0 auto;
    padding: 0 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 4rem;
    `}

    ${respondDown(Breakpoints.xs)`
        padding: 0 1.6rem;
    `}
`;

const Title = styled.h2`
    font-weight: 700;
    font-size: 5.6rem;
    line-height: 6.4rem;
    margin-bottom: 3.4rem;
`;

const List = styled.div`
    ${flexColumn};
    width: 60%;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Delegate = () => {
    const [selected, setSelected] = useState<number | null>(null);
    const [fromTop, setFromTop] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [delegatees, setDelegatees] = useState(null);

    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getDelegatees().then(setDelegatees);
    }, []);

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

    return (
        <Main>
            <Wrapper>
                {!delegatees ? (
                    <PageLoader />
                ) : (
                    <List ref={listRef}>
                        <Title>Delegates</Title>

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
                )}
            </Wrapper>
        </Main>
    );
};
export default Delegate;
