import * as React from 'react';
import styled from 'styled-components';

import { isAndroid } from 'helpers/browser';

import { respondDown } from 'styles/mixins';
import { Breakpoints } from 'styles/style-constants';

const Svg = styled.svg`
    height: 100px;
    width: 320px;

    text {
        font-size: 106px;
        transform: translateY(84px);
    }

    ${respondDown(Breakpoints.lg)`
        text {
            font-size: 74px;
            transform: translateY(73px);
        }  
    `}

    ${respondDown(Breakpoints.md)`
        text {
            font-size: 52px;
            transform: translateY(66px);
            stroke-width: 2;
        }  
    `}
`;

const GradientBorderedText = styled.span`
    display: inline-block;
    font-family: Arial, sans-serif;
    font-size: 10rem;
    line-height: 100%;
    font-weight: 700;
    color: white;
    margin-left: 0.8rem;

    -webkit-text-stroke: 4px transparent;
    background: linear-gradient(90deg, #bf61e8, #6423af);
    -webkit-background-clip: text;
    background-clip: text;

    ${respondDown(Breakpoints.lg)`
        font-size: 7rem;
        -webkit-text-stroke: 3px transparent;
        margin-left: 0.4rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 5rem;
        -webkit-text-stroke: 2px transparent;
        margin-left: 0.4rem;
    `}
`;

interface Props {
    text: string;
}

const AnimatedBorderedText = ({ text }: Props) => {
    if (isAndroid()) {
        return <GradientBorderedText>{text}</GradientBorderedText>;
    }

    return (
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
};

export default AnimatedBorderedText;
