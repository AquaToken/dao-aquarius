import * as React from 'react';
import styled from 'styled-components';

import { ModalService } from 'services/globalServices';

import { BlankExternalLink } from 'basics/links';

import { commonMaxWidth, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE, hexWithOpacity } from 'styles/style-constants';

import ExperimentalFeatureModal, {
    ExperimentalFeatureModalBackground,
} from '../../../ExperimentalFeatureModal/ExperimentalFeatureModal';

const Wrapper = styled.div`
    width: 100%;
    background-color: ${hexWithOpacity(COLORS.yellow500, 35)};
`;

const Inner = styled.div`
    ${commonMaxWidth};
    display: flex;
    align-items: center;
    gap: 1.4rem;
    width: 100%;
    min-height: 8rem;
    padding: 0 4rem;

    ${respondDown(Breakpoints.md)`
        align-items: flex-start;
        flex-direction: column;
        gap: 1.6rem;
        min-height: unset;
        padding: 1.6rem;
    `}
`;

const Emoji = styled.span`
    ${FONT_SIZE.md};
    flex-shrink: 0;
    line-height: 3.2rem;
`;

const Content = styled.div`
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
    flex-direction: column;
    gap: 0.4rem;
`;

const Title = styled.p`
    margin: 0;
    font-size: 1.4rem;
    line-height: 2rem;
    font-weight: 700;
    color: ${COLORS.textSecondary};
`;

const Text = styled.p`
    margin: 0;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
`;

const ReadMoreLink = styled(BlankExternalLink)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16rem;
    padding: 1.5rem 3.2rem;
    border: 0.2rem solid ${COLORS.black};
    border-radius: 1.6rem;
    font-size: 1.4rem;
    line-height: 1.6rem;
    font-weight: 700;
    letter-spacing: 0.14rem;
    text-transform: uppercase;
    color: ${COLORS.purple950};

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const ConcentratedPoolDisclaimer = (): React.ReactNode => {
    const openDisclaimerModal = () =>
        ModalService.openModal(
            ExperimentalFeatureModal,
            {},
            true,
            <ExperimentalFeatureModalBackground />,
            true,
        );

    return (
        <Wrapper>
            <Inner>
                <Emoji role="img" aria-label="Warning">
                    ☝️
                </Emoji>
                <Content>
                    <Title>Experimental Feature - use at your own risk</Title>
                    <Text>
                        This feature is unaudited and may contain bugs. Deposits are at risk, and
                        any potential compensation is limited.
                    </Text>
                </Content>
                <ReadMoreLink onClick={openDisclaimerModal}>Read more</ReadMoreLink>
            </Inner>
        </Wrapper>
    );
};

export default ConcentratedPoolDisclaimer;
