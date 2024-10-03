import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getAmmRewards, getAquaInPoolsSum } from 'api/amm';
import { getAquaCirculatingSupply } from 'api/cmc';
import { getIceStatistics } from 'api/ice-locker';
import { getTotalRewards } from 'api/rewards';
import { getAssetDetails } from 'api/stellar-expert';

import { AQUA_ASSET_STRING } from 'constants/assets';

import { getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { getPercentValue } from 'helpers/number';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { IceStatistics } from 'types/api-ice-locker';
import { ExpertAssetData } from 'types/api-stellar-expert';

import { StellarService } from 'services/globalServices';
import { AQUA_CODE, AQUA_ISSUER } from 'services/stellar.service';
import { respondDown, respondUp } from 'web/mixins';
import { Breakpoints, COLORS, FONT_FAMILY } from 'web/styles';

import Info from 'assets/icon-info.svg';
import InvestAmmImage from 'assets/landing-about-amm-80.svg';
import FreezeIceImage from 'assets/landing-about-ice-80.svg';
import VoteMarketsImage from 'assets/landing-about-vote-markets-80.svg';
import VoteProposalsImage from 'assets/landing-about-vote-proposals-80.svg';

import Changes24 from 'basics/Changes24';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import Asset from '../../../vote/components/AssetDropdown/Asset';

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
    white-space: wrap;

    ${respondDown(Breakpoints.xs)`
        width: 13rem;
    `}
`;

const StatsDescription = styled.span`
    margin-top: 0.8rem;
`;

const About = (): React.ReactElement => {
    const { assetsInfo } = useAssetsStore();

    const location = useLocation();

    const aquaAsset = assetsInfo.get(AQUA_ASSET_STRING);
    const { first_transaction, liquidity_pools_amount } = aquaAsset || {};

    const [iceStats, setIceStats] = useState<IceStatistics>(null);
    const [expertData, setExpertData] = useState<ExpertAssetData>(undefined);
    const [totalRewards, setTotalRewards] = useState<number>(null);
    const [aquaInSorobanAmm, setAquaInSorobanAmm] = useState<number>(null);
    const [aquaCirculatingSupply, setAquaCirculatingSupply] = useState<number>(null);

    const aquaTokenRef = useRef(null);

    useEffect(() => {
        if (location.hash === '#token' && aquaTokenRef.current) {
            aquaTokenRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [location, aquaTokenRef]);

    useEffect(() => {
        getAssetDetails(StellarService.createAsset(AQUA_CODE, AQUA_ISSUER))
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
                    <Description>
                        Aquarius is designed to supercharge trading on Stellar, bring more liquidity
                        and give control over how it is distributed across various market pairs. It
                        adds incentives for SDEX traders ("market maker rewards") and rewards for
                        AMM liquidity providers. Aquarius allows community to set rewards for
                        selected markets through on-chain voting.
                    </Description>
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
                                                $
                                                {formatBalance(
                                                    expertData?.price7d?.[
                                                        expertData?.price7d.length - 1
                                                    ]?.[1] ?? 0,
                                                    true,
                                                )}
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
                                AQUA is the currency for rewards and on-chain voting in Aquarius.
                                Holders of AQUA can vote for trusted assets issued on Stellar or
                                choose market pairs that require additional liquidity. Liquidity
                                providers can earn AQUA by actively trading on the selected market
                                pairs. AQUA will also play an important role in projects being
                                developed by Ultra Stellar. Most of created AQUA tokens will be
                                distributed freely to network participants and market makers.
                                Contact email for institutional investors - tokens@aqua.network.
                            </Description>
                        </AquaTokenStatsDescription>
                    </AquaInfoContainer>

                    <TitleAquaInfoSection>What can I do with AQUA token?</TitleAquaInfoSection>
                    <AquaInfoContainer>
                        <AquaInfoBlockData>
                            <IconWithTitleWrapper>
                                <InvestAmmImage />
                                <TitleAquaInfoBlock>Invest into AMM</TitleAquaInfoBlock>
                            </IconWithTitleWrapper>

                            <Description>
                                In the Pools section you can deposit AQUA into one of the volatile
                                pools with other Stellar assets to start getting LP rewards. If the
                                market you are investing into is in the reward zone based on voting,
                                you’ll get additional AQUA rewards. Check the Voting section to find
                                out which markets are currently in the reward zone.
                            </Description>
                        </AquaInfoBlockData>

                        <AquaInfoBlockData>
                            <IconWithTitleWrapper>
                                <FreezeIceImage />
                                <TitleAquaInfoBlock>Freeze into ICE</TitleAquaInfoBlock>
                            </IconWithTitleWrapper>

                            <Description>
                                Freeze your AQUA into ICE to increase your voting power. In exchange
                                for each AQUA token you’ll get <b>ICE, upvoteICE, downvoteICE</b>{' '}
                                and <b>governICE</b> tokens designed for specific usage. Keeping
                                your AQUA frozen increases the efficiency of your investment.
                            </Description>
                        </AquaInfoBlockData>

                        <AquaInfoBlockData>
                            <IconWithTitleWrapper>
                                <VoteProposalsImage />
                                <TitleAquaInfoBlock>Vote for proposals</TitleAquaInfoBlock>
                            </IconWithTitleWrapper>

                            <Description>
                                AQUA grants a holder power to participate in the community voting
                                for proposals. Want to influence the future of the Aquarius
                                protocol? Check for active proposals in the Governance section.
                            </Description>
                        </AquaInfoBlockData>

                        <AquaInfoBlockData>
                            <IconWithTitleWrapper>
                                <VoteMarketsImage />
                                <TitleAquaInfoBlock>Vote for markets</TitleAquaInfoBlock>
                            </IconWithTitleWrapper>

                            <Description>
                                Each AQUA holder can vote for markets so they get into the reward
                                zone. Check the markets available in the Voting section.
                            </Description>
                        </AquaInfoBlockData>
                    </AquaInfoContainer>
                </AquaWrapper>
            </AquaSection>
        </>
    );
};

export default About;
