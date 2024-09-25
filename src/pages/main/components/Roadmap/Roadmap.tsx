import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import ArrowLeft from 'assets/icon-arrow-left.svg';
import ArrowRight from 'assets/icon-arrow-right.svg';
import IconTick from 'assets/icon-tick-white.svg';

import { completedStepsCount, steps } from './constants';

import { respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';

const Container = styled.section`
    padding-top: 16rem;
    display: flex;
    justify-content: center;
    flex: auto;
    position: relative;
    min-height: 0;
    overflow: hidden;
`;

const Wrapper = styled.div`
    width: 100%;
    max-width: 142rem;
    padding: 0 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
        max-width: 55rem;
    `}
`;

const Header = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 2.7rem;
    `}
`;

const Title = styled.div`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.4rem;
`;

const Controls = styled.div`
    display: flex;

    ${respondDown(Breakpoints.md)`
         margin-top: 2rem;
    `}
`;

const ControlButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 5rem;
    width: 5rem;
    border-radius: 50%;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    cursor: pointer;

    &:hover {
        color: ${COLORS.purple};
    }

    &:not(:last-child) {
        margin-right: 1.8rem;
    }
`;

const SliderContainer = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    position: relative;
`;

const SliderWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    overflow: hidden;
`;

const SliderPillar = styled.div`
    position: absolute;
    height: 0.1rem;
    background: linear-gradient(
        to right,
        ${COLORS.white} 0%,
        ${COLORS.gray} 10%,
        ${COLORS.gray} 90%,
        ${COLORS.white} 100%
    );
    top: 7.8rem;
    left: -10rem;
    transition: all 0.5s ease-in-out;
`;

const SliderFiller = styled.div`
    position: absolute;
    height: 0.1rem;
    background: linear-gradient(
        to right,
        ${COLORS.white} 0%,
        ${COLORS.tooltip} 50%,
        ${COLORS.tooltip} 100%
    );
    top: 7.8rem;
    left: -10rem;
    transform: translateZ(0.2rem);
    transition: all 0.5s ease-in-out;
`;

const Slider = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    transition: all 0.5s ease-in-out;
`;

const Slide = styled.div`
    display: flex;
    flex-direction: column;
    width: 36rem;
    min-width: calc(33% - 4rem);
    transform: translateZ(0.3rem);

    &:not(:last-child) {
        margin-right: 6rem;
    }

    ${respondDown(Breakpoints.md)`
         min-width: 100% !important;
    `}
`;

const SlideDate = styled.div`
    font-size: 1.6rem;
    line-height: 3rem;
    color: ${COLORS.darkGrayText};
    margin-bottom: 3.2rem;
`;

const SlideProgress = styled.div<{ $active?: boolean }>`
    width: 3.2rem;
    height: 3.2rem;
    background: ${({ $active }) => ($active ? COLORS.tooltip : COLORS.white)};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 3.2rem;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
`;

const SlideTitle = styled.div`
    font-size: 2rem;
    line-height: 2.3rem;
    color: ${COLORS.titleText};
    margin-bottom: 1.6rem;
`;

const SlideText = styled.div`
    font-size: 1.6rem;
    line-height: 3rem;
    color: ${COLORS.darkGrayText};
`;

const SLIDE_PADDING = 60;
const PILLAR_OFFSET = 200;
const FILLER_OFFSET = 100;

const Roadmap = () => {
    const [activeSlide, setActiveSlide] = useState(completedStepsCount);
    const sliderRef = useRef(null);
    const pillarRef = useRef(null);
    const fillerRef = useRef(null);

    const pillarWidth = useRef(null);
    const fillerWidth = useRef(null);
    const slideWidth = useRef(null);

    const isMobile = useRef(null);

    const initSlider = () => {
        isMobile.current = +window.innerWidth < 992;

        const slidesCount = steps.length;

        slideWidth.current = sliderRef.current.children[0].getBoundingClientRect().width;

        pillarWidth.current =
            slidesCount * slideWidth.current + PILLAR_OFFSET + (slidesCount - 1) * SLIDE_PADDING;
        fillerWidth.current =
            FILLER_OFFSET + (completedStepsCount - 1) * (slideWidth.current + SLIDE_PADDING);

        pillarRef.current.style.width = `${pillarWidth.current}px`;
        fillerRef.current.style.width = `${fillerWidth.current}px`;
    };

    useEffect(() => {
        initSlider();
    }, []);

    useEffect(() => {
        const position = (activeSlide - 1) * -(slideWidth.current + SLIDE_PADDING);
        fillerRef.current.setAttribute(
            'style',
            `transform: translateX(${position}px); width: ${fillerWidth.current}px;`,
        );
        pillarRef.current.setAttribute(
            'style',
            `transform: translateX(${position}px); width: ${pillarWidth.current}px;`,
        );
        sliderRef.current.setAttribute('style', `transform: translateX(${position}px)`);
    }, [activeSlide]);

    const nextSlide = () => {
        if (activeSlide + 1 > (isMobile.current ? steps.length : steps.length - 2)) {
            return;
        }
        setActiveSlide(prevState => prevState + 1);
    };

    const previousSlide = () => {
        if (activeSlide - 1 < 1) {
            return;
        }

        setActiveSlide(prevState => prevState - 1);
    };

    return (
        <Container>
            <Wrapper>
                <Header>
                    <Title>Roadmap</Title>

                    <Controls>
                        <ControlButton onClick={() => previousSlide()}>
                            <ArrowLeft />
                        </ControlButton>
                        <ControlButton onClick={() => nextSlide()}>
                            <ArrowRight />
                        </ControlButton>
                    </Controls>
                </Header>

                <SliderContainer>
                    <SliderPillar ref={pillarRef} />
                    <SliderFiller ref={fillerRef} />

                    <SliderWrapper>
                        <Slider ref={sliderRef}>
                            {steps.map(({ date, title, text }, index) => (
                                <Slide key={date}>
                                    <SlideDate>{date}</SlideDate>
                                    <SlideProgress $active={index + 1 <= completedStepsCount}>
                                        <IconTick />
                                    </SlideProgress>
                                    <SlideTitle>{title}</SlideTitle>
                                    <SlideText>{text}</SlideText>
                                </Slide>
                            ))}
                        </Slider>
                    </SliderWrapper>
                </SliderContainer>
            </Wrapper>
        </Container>
    );
};

export default Roadmap;
