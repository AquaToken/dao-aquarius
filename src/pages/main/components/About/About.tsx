import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getAmmRewards, getAquaInPoolsSum } from 'api/amm';
import { getAquaCirculatingSupply } from 'api/cmc';
import { getIceStatistics } from 'api/ice-locker';
import { getTotalRewards } from 'api/rewards';
import { getAssetDetails } from 'api/stellar-expert';

import { getAquaAssetData } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { getPercentValue } from 'helpers/number';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { ModalService, StellarService } from 'services/globalServices';

import { IceStatistics } from 'types/api-ice-locker';
import { ExpertAssetData } from 'types/api-stellar-expert';

import { respondDown, respondUp } from 'web/mixins';
import { Breakpoints, COLORS, FONT_FAMILY } from 'web/styles';

import Info from 'assets/icon-info.svg';
import InvestAmmImage from 'assets/landing-about-amm-80.svg';
import FreezeIceImage from 'assets/landing-about-ice-80.svg';
import VoteMarketsImage from 'assets/landing-about-vote-markets-80.svg';
import VoteProposalsImage from 'assets/landing-about-vote-proposals-80.svg';

import Asset from 'basics/Asset';
import { Button } from 'basics/buttons';
import Changes24 from 'basics/Changes24';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import GetAquaModal from '../../../../web/modals/GetAquaModal';

const WhatIsSection = styled.section`
    display: flex;
    justify-content: center;
    flex: auto;
    margin: 16.5rem 0;

    position: relative;

    ${respondDown(Breakpoints.xl)`
        padding: 8rem 0 8rem;
        margin: 0;
    `}
`;

const Wrapper = styled.div`
    margin-left: 14rem;
    max-width: 110rem;
    padding: 0 10rem;

    ${respondDown(Breakpoints.xl)`
        padding: 0 1.6rem;
        max-width: 55rem;
        margin-left: 0;
    `}
`;

const Title = styled.div`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.titleText};
    margin-bottom: 3rem;

    ${respondDown(Breakpoints.xl)`
        font-size: 2.9rem;
        line-height: 3.4rem;
        margin-bottom: 1.6rem;
    `}
`;

const TitleAquaInfoSection = styled(Title)`
    margin-bottom: 0;
    margin-top: 10.2rem;
    max-width: 57.7rem;

    ${respondDown(Breakpoints.lg)`
        padding: 0px 1.6rem;
    `}
`;

const TitleAquaInfoBlock = styled(Title)`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    margin-bottom: 0;
    margin-left: 0.8rem;
`;

const Description = styled.div`
    color: ${COLORS.darkGrayText};
    font-size: 1.6rem;
    line-height: 2.8rem;

    ${respondDown(Breakpoints.xl)`
        font-size: 1.4rem;
        line-height: 2.5rem;
        margin-bottom: 4rem;
    `}
`;

const MainDescription = styled(Description)`
    font-size: 2rem;

    ${respondDown(Breakpoints.xl)`
        font-size: 1.6rem;
    `}
`;

const AquaSection = styled(WhatIsSection)`
    margin-top: 0;
    margin-bottom: 0;
    background-color: ${COLORS.lightGray};
    padding-top: 0;
`;

const AquaWrapper = styled(Wrapper)`
    padding: 0;
    margin: 11.6rem 0;
    max-width: 121.5rem;
    background-color: ${COLORS.lightGray};

    ${respondDown(Breakpoints.xl)`
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 0 10rem;
    `}
`;

const AquaInfoContainer = styled.div`
    display: inline-flex;
    justify-content: space-between;
    flex-flow: row wrap;
    width: 100%;

    ${respondDown(Breakpoints.xl)`
        justify-content: center;
    `}
`;

const AquaInfoBlock = styled.div`
    display: flex;
    flex-basis: 50%;
    flex-direction: column;
    max-width: 57.7rem;
    padding: 6.2rem;

    ${respondDown(Breakpoints.xl)`
        flex-basis: 100%;
        padding: 6.2rem 1.6rem;
    `}
`;

const AquaTokenStats = styled(AquaInfoBlock)`
    box-shadow: 0 2rem 3rem 0 rgba(0, 6, 54, 0.06);
    background-color: ${COLORS.white};

    ${respondUp(Breakpoints.xl)`
        min-width: 57.7rem;
        flex-basis: unset;
    `}
`;

const AquaTokenStatsDescription = styled(AquaInfoBlock)`
    padding: 5.2rem 1.6rem 5.2rem 1.6rem;

    ${respondUp(Breakpoints.md)`
        max-width: 63.8rem;
        flex-basis: unset;
        padding: 3.6rem 0 3.6rem 6.2rem;
    `}
`;

const AquaInfoBlockData = styled(AquaTokenStats)`
    box-shadow: none;
    margin-top: 6.2rem;
`;

const IconWithTitleWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 1.6rem;
`;

const AquaWithPriceBlock = styled.div`
    display: flex;
    justify-content: space-between;
`;

const AquaPriceBlock = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: end;
`;

const AquaPrice = styled.div`
    font-family: ${FONT_FAMILY.roboto};
    font-size: 1.6rem;
    line-height: 2.4rem;
`;

const AquaDivider = styled.hr`
    width: 100%;
    margin-top: 3.2rem;
    margin-bottom: 0;
    border: 0;
    border-top: 1px solid rgba(232, 232, 237, 1);
`;

const AquaStatsBlock = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const StatWrapper = styled.div`
    flex: 1 1 33.33%;
    display: flex;
    flex-direction: column;
    margin-top: 3.2rem;
    max-width: 14rem;

    ${respondDown(Breakpoints.sm)`
        min-width: 50%;
    `}
`;

const StatsTitle = styled.span`
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 1.6rem;
    display: flex;
    align-items: center;

    svg {
        margin: 0 0.4rem;
    }
`;

const TooltipInner = styled.span`
    width: 15rem;
    white-space: normal;

    ${respondDown(Breakpoints.xs)`
        width: 13rem;
    `}
`;

const StatsDescription = styled.span`
    margin-top: 0.8rem;
`;

const StyledButton = styled(Button)`
    margin: auto 0 0;
`;

const About = (): React.ReactElement => {
    const { assetsInfo } = useAssetsStore();

    const location = useLocation();

    const { aquaStellarAsset, aquaAssetString } = getAquaAssetData();

    const aquaAsset = assetsInfo.get(aquaAssetString);
    const { first_transaction, liquidity_pools_amount } = aquaAsset || {};

    const [iceStats, setIceStats] = useState<IceStatistics>(null);
    const [expertData, setExpertData] = useState<ExpertAssetData>(undefined);
    const [totalRewards, setTotalRewards] = useState<number>(null);
    const [aquaInSorobanAmm, setAquaInSorobanAmm] = useState<number>(null);
    const [aquaCirculatingSupply, setAquaCirculatingSupply] = useState<number>(null);
    const [aquaUsdPrice, setAquaUsdPrice] = useState<number>(0);

    const aquaTokenRef = useRef(null);

    useEffect(() => {
        if (location.hash === '#token' && aquaTokenRef.current) {
            aquaTokenRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [location, aquaTokenRef]);

    useEffect(() => {
        StellarService.getAquaUsdPrice().then(setAquaUsdPrice);
    }, []);

    useEffect(() => {
        getAssetDetails(aquaStellarAsset)
            .then(data => {
                setExpertData(data);
            })
            .catch(() => {
                setExpertData(null);
            });

        getIceStatistics().then(res => {
            setIceStats(res);
        });

        Promise.all([getAmmRewards(), getTotalRewards()]).then(
            ([ammRewards, { total_daily_amm_reward, total_daily_sdex_reward }]) => {
                setTotalRewards(ammRewards + total_daily_amm_reward + total_daily_sdex_reward);
            },
        );

        getAquaInPoolsSum().then(res => {
            setAquaInSorobanAmm(res);
        });

        getAquaCirculatingSupply().then(res => {
            setAquaCirculatingSupply(res);
        });
    }, []);

    return (
        <>
            <WhatIsSection>
                <Wrapper>
                    <Title>What is Aquarius?</Title>
                    <MainDescription>
                        Aquarius is Stellar’s liquidity hub, featuring a powerful AMM engine,
                        rewards for liquidity providers and traders, and community control over
                        reward distribution across market pairs.
                    </MainDescription>
                </Wrapper>
            </WhatIsSection>

            <AquaSection ref={aquaTokenRef}>
                <AquaWrapper>
                    <AquaInfoContainer id="aqua-token">
                        <AquaTokenStats>
                            {!aquaAsset ? (
                                <PageLoader />
                            ) : (
                                <>
                                    <AquaWithPriceBlock>
                                        <Asset asset={aquaAsset} isBig />
                                        <AquaPriceBlock>
                                            <AquaPrice>
                                                ${formatBalance(aquaUsdPrice, true)}
                                            </AquaPrice>
                                            <Changes24 expertData={expertData} />
                                        </AquaPriceBlock>
                                    </AquaWithPriceBlock>
                                    <AquaDivider />
                                    <AquaStatsBlock>
                                        <StatWrapper>
                                            <StatsTitle>First transaction: </StatsTitle>
                                            <StatsDescription>
                                                {getDateString(
                                                    new Date(first_transaction).getTime(),
                                                )}
                                            </StatsDescription>
                                        </StatWrapper>
                                        <StatWrapper>
                                            <StatsTitle>Payments volume: </StatsTitle>
                                            <StatsDescription>
                                                {expertData ? (
                                                    formatBalance(
                                                        expertData?.payments_amount / 1e7,
                                                        true,
                                                    )
                                                ) : (
                                                    <DotsLoader />
                                                )}
                                            </StatsDescription>
                                        </StatWrapper>
                                        <StatWrapper>
                                            <StatsTitle>Traded volume:</StatsTitle>
                                            <StatsDescription>
                                                {expertData ? (
                                                    formatBalance(
                                                        expertData?.traded_amount / 1e7,
                                                        true,
                                                        false,
                                                    )
                                                ) : (
                                                    <DotsLoader />
                                                )}
                                            </StatsDescription>
                                        </StatWrapper>
                                        <StatWrapper>
                                            <StatsTitle>
                                                Total frozen:
                                                <Tooltip
                                                    content={
                                                        <TooltipInner>
                                                            AQUA holders can lock/freeze their
                                                            tokens and receive ICE tokens with
                                                            greater voting power
                                                        </TooltipInner>
                                                    }
                                                    position={TOOLTIP_POSITION.top}
                                                    showOnHover
                                                >
                                                    <Info />
                                                </Tooltip>
                                            </StatsTitle>
                                            <StatsDescription>
                                                {iceStats && aquaCirculatingSupply !== null ? (
                                                    `${formatBalance(
                                                        Number(iceStats.aqua_lock_amount),
                                                        true,
                                                    )}(${getPercentValue(
                                                        Number(iceStats.aqua_lock_amount),
                                                        aquaCirculatingSupply,
                                                    )}%)`
                                                ) : (
                                                    <DotsLoader />
                                                )}
                                            </StatsDescription>
                                        </StatWrapper>
                                        <StatWrapper>
                                            <StatsTitle>Total locked in AMM:</StatsTitle>
                                            <StatsDescription>
                                                {aquaInSorobanAmm !== null &&
                                                aquaCirculatingSupply !== null &&
                                                Number(liquidity_pools_amount) ? (
                                                    `${formatBalance(
                                                        aquaInSorobanAmm +
                                                            Number(liquidity_pools_amount),
                                                        true,
                                                    )}(${getPercentValue(
                                                        Number(liquidity_pools_amount),
                                                        aquaCirculatingSupply,
                                                    )}%)`
                                                ) : (
                                                    <DotsLoader />
                                                )}
                                            </StatsDescription>
                                        </StatWrapper>
                                        <StatWrapper>
                                            <StatsTitle>
                                                Daily rewards:
                                                <Tooltip
                                                    content={
                                                        <TooltipInner>
                                                            Aquarius distributes AQUA tokens to the
                                                            liquidity providers every day
                                                        </TooltipInner>
                                                    }
                                                    position={TOOLTIP_POSITION.top}
                                                    showOnHover
                                                >
                                                    <Info />
                                                </Tooltip>
                                            </StatsTitle>
                                            <StatsDescription>
                                                {totalRewards ? (
                                                    formatBalance(totalRewards, true)
                                                ) : (
                                                    <DotsLoader />
                                                )}
                                            </StatsDescription>
                                        </StatWrapper>
                                    </AquaStatsBlock>
                                </>
                            )}
                        </AquaTokenStats>
                        <AquaTokenStatsDescription>
                            <Title>AQUA token</Title>
                            <Description>
                                AQUA powers rewards and on-chain voting in Aquarius. Holders can
                                vote for trusted Stellar assets or market pairs needing liquidity.
                                Liquidity providers earn AQUA by trading on these selected pairs.
                            </Description>
                            <StyledButton
                                onClick={() => ModalService.openModal(GetAquaModal, {})}
                                isBig
                            >
                                Get AQUA Tokens
                            </StyledButton>
                        </AquaTokenStatsDescription>
                    </AquaInfoContainer>

                    <TitleAquaInfoSection>Utility of AQUA</TitleAquaInfoSection>
                    <AquaInfoContainer>
                        <AquaInfoBlockData>
                            <IconWithTitleWrapper>
                                <InvestAmmImage />
                                <TitleAquaInfoBlock>Deposit into AMM</TitleAquaInfoBlock>
                            </IconWithTitleWrapper>

                            <MainDescription>
                                Deposit AQUA into Aquarius AMM pools with Stellar assets to earn LP
                                rewards from trading. Markets in the reward zone grant extra AQUA
                                emission rewards.
                            </MainDescription>
                        </AquaInfoBlockData>

                        <AquaInfoBlockData>
                            <IconWithTitleWrapper>
                                <FreezeIceImage />
                                <TitleAquaInfoBlock>Freeze into ICE</TitleAquaInfoBlock>
                            </IconWithTitleWrapper>

                            <MainDescription>
                                Convert your AQUA into ICE to boost your voting power. Each frozen
                                AQUA gives you ICE, which can be used for Aquarius governance and
                                additional benefits.
                            </MainDescription>
                        </AquaInfoBlockData>

                        <AquaInfoBlockData>
                            <IconWithTitleWrapper>
                                <VoteProposalsImage />
                                <TitleAquaInfoBlock>Vote for proposals</TitleAquaInfoBlock>
                            </IconWithTitleWrapper>

                            <MainDescription>
                                Use AQUA to participate in community voting and shape the future of
                                the Aquarius protocol. Explore active proposals in the DAO section.
                            </MainDescription>
                        </AquaInfoBlockData>

                        <AquaInfoBlockData>
                            <IconWithTitleWrapper>
                                <VoteMarketsImage />
                                <TitleAquaInfoBlock>Vote for markets</TitleAquaInfoBlock>
                            </IconWithTitleWrapper>

                            <MainDescription>
                                AQUA holders can vote to add markets to the reward zone, deciding
                                which markets earn AQUA emissions. Receive extra incentives for
                                supporting certain pools.
                            </MainDescription>
                        </AquaInfoBlockData>
                    </AquaInfoContainer>
                </AquaWrapper>
            </AquaSection>
        </>
    );
};

export default About;
