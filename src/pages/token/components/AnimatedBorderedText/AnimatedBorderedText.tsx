import * as React from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

interface Props {
    text: string;
}

const Svg = styled.svg`
    height: 100px;

    text {
        font-size: 100px;
        transform: translateY(84px);
    }

    ${respondDown(Breakpoints.lg)`
        text {
            font-size: 70px;
            transform: translateY(73px);
        }  
    `}

    ${respondDown(Breakpoints.md)`
        text {
            font-size: 50px;
            transform: translateY(66px);
        }  
    `}
`;

const AnimatedBorderedText = ({ text }: Props) => (
    <Svg xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient
                id="moving-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
                spreadMethod="reflect"
            >
                <stop offset="0%" stopColor="#BF61E8" />
                <stop offset="50%" stopColor="#6423AF" />
                <stop offset="100%" stopColor="#BF61E8" />
                <animateTransform
                    attributeName="gradientTransform"
                    type="translate"
                    from="-1 0"
                    to="1 0"
                    dur="4s"
                    repeatCount="indefinite"
                />
            </linearGradient>

            <mask id="text-mask">
                <text x="20" y="0" stroke="white" strokeWidth="3" fill="black">
                    {text}
                </text>
            </mask>
        </defs>

        <rect width="100%" height="100%" fill="url(#moving-gradient)" mask="url(#text-mask)" />
    </Svg>
);

export default AnimatedBorderedText;
