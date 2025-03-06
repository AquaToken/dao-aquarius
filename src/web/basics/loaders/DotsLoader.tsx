import { useEffect, useState } from 'react';
import * as React from 'react';
import styled from 'styled-components';

const DOTS_COUNT = 3;
const DOT_SYMBOL = '.';
const DOTS = new Array(DOTS_COUNT).fill(DOT_SYMBOL);

const Dot = styled.span<{ $isVisible: boolean }>`
    visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
`;

const DotsLoader = ({ ...props }): React.ReactElement => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % DOTS_COUNT);
        }, 300);

        return () => clearInterval(interval);
    }, []);

    return (
        <span {...props}>
            {DOTS.map((dot, index) => {
                const isVisible = index <= currentIndex;

                return (
                    <Dot key={index} $isVisible={isVisible}>
                        {dot}
                    </Dot>
                );
            })}
        </span>
    );
};

export default DotsLoader;
