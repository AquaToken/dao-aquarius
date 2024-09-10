import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ModalContainer } from '../atoms/ModalAtoms';
import Asset from '../../../pages/vote/components/AssetDropdown/Asset';
import useAssetsStore from '../../../store/assetsStore/useAssetsStore';
import { formatBalance, getAssetString, getDateString } from '../../helpers/helpers';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../styles';
import { StellarToml } from '@stellar/stellar-sdk';
import { getAssetDetails } from '../../api/api';
import X from '../../assets/img/twitter16.svg';
import Git from '../../assets/img/github16.svg';
import Mail from '../../assets/img/email16.svg';
import External from '../../assets/img/icon-external-link-black.svg';
import Positive from '../../assets/img/icon-positive-changes.svg';
import Negative from '../../assets/img/icon-negative-changes.svg';
import PageLoader from '../../basics/PageLoader';
import { AssetDetails } from '../../api/types';
import { respondDown } from '../../mixins';
import DotsLoader from '../../basics/DotsLoader';
import Button from '../../basics/Button';
import { MainRoutes } from '../../../routes';
import { StellarService } from '../../services/globalServices';
import { AQUA_CODE, AQUA_ISSUER } from '../../services/stellar.service';
import { Link } from 'react-router-dom';
import NoTrustline from '../../components/NoTrustline/NoTrustline';

const Description = styled.p`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
    margin: 2.4rem 0 1.6rem;
`;

const Links = styled.div`
    display: flex;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 1rem;
    `}
`;

const ContactLink = styled.a`
    display: flex;
    align-items: center;
    color: ${COLORS.purple};
    text-decoration: none;
    margin-right: 2.4rem;
    font-size: 1.6rem;
    line-height: 2.8rem;

    svg {
        margin-right: 0.4rem;
    }
`;

const Details = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-top: 4rem;
    gap: 3.2rem;
`;

const Detail = styled.div`
    flex: 1;
    min-width: 30%;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    color: ${COLORS.paragraphText};

    span:first-child {
        color: ${COLORS.grayText};
    }
`;

const Changes = styled.span<{ isPositive?: boolean }>`
    display: flex;
    align-items: center;
    color: ${({ isPositive }) => (isPositive ? COLORS.green : COLORS.pinkRed)}!important;

    svg {
        margin-right: 0.4rem;
    }
`;

const Buttons = styled.div`
    display: flex;
    margin-top: 3.2rem;
    gap: 1.2rem;

    Button {
        flex: 1;
    }
`;

const LinkStyled = styled(Link)`
    display: flex;
    flex: 1;

    text-decoration: none;
`;

const AssetInfoModal = ({ params, close }) => {
    const { asset } = params;

    const [tomlInfo, setTomlInfo] = useState<StellarToml.Api.StellarToml>({});
    const [expertData, setExpertData] = useState<AssetDetails>(undefined);

    const { assetsInfo } = useAssetsStore();

    const { desc, home_domain } = assetsInfo.get(getAssetString(asset)) || {};

    useEffect(() => {
        StellarToml.Resolver.resolve(home_domain)
            .then((res) => {
                setTomlInfo(res);
            })
            .catch(() => {
                setTomlInfo({});
            });

        getAssetDetails(asset)
            .then((details) => {
                setExpertData(details);
            })
            .catch(() => {
                setExpertData(null);
            });
    }, []);

    const changes24 = useMemo(() => {
        if (!expertData) {
            return <DotsLoader />;
        }
        const lastPrice = expertData?.price7d?.[expertData.price7d?.length - 1]?.[1] ?? 0;
        const prevPrice = expertData?.price7d?.[expertData.price7d?.length - 2]?.[1] ?? 0;

        if (!prevPrice || !lastPrice) {
            return <span>-</span>;
        }

        const changes = formatBalance((lastPrice / prevPrice - 1) * 100, true);

        if (!Number(changes)) {
            return <span>0.00</span>;
        }

        return (
            <Changes isPositive={Number(changes) > 0}>
                {Number(changes) > 0 ? <Positive /> : <Negative />}
                {Math.abs(Number(changes))} %
            </Changes>
        );
    }, [expertData]);

    return (
        <ModalContainer isWide>
            <Asset asset={asset} isBig hasDomainLink />
            <Description>{desc}</Description>
            <Links>
                {tomlInfo.DOCUMENTATION?.ORG_TWITTER && (
                    <ContactLink
                        target="_blank"
                        href={`https://x.com/${tomlInfo.DOCUMENTATION.ORG_TWITTER}`}
                    >
                        <X />
                        {tomlInfo.DOCUMENTATION.ORG_TWITTER}
                    </ContactLink>
                )}
                {tomlInfo.DOCUMENTATION?.ORG_GITHUB && (
                    <ContactLink
                        target="_blank"
                        href={`https://github.com/${tomlInfo.DOCUMENTATION.ORG_GITHUB}`}
                    >
                        <Git />
                        {tomlInfo.DOCUMENTATION.ORG_GITHUB}
                    </ContactLink>
                )}
                {tomlInfo.DOCUMENTATION?.ORG_OFFICIAL_EMAIL && (
                    <ContactLink
                        target="_blank"
                        href={`mailto:${tomlInfo.DOCUMENTATION.ORG_OFFICIAL_EMAIL}`}
                    >
                        <Mail />
                        {tomlInfo.DOCUMENTATION.ORG_OFFICIAL_EMAIL}
                    </ContactLink>
                )}
                <ContactLink
                    target="_blank"
                    href={`https://stellar.expert/explorer/public/asset/${asset.code}-${asset.issuer}`}
                >
                    <External />
                    StellarExpert
                </ContactLink>
            </Links>
            {expertData !== undefined ? (
                Boolean(expertData) ? (
                    <Details>
                        <Detail>
                            <span>Asset holders:</span>
                            <span>{formatBalance(expertData.trustlines[0])}</span>
                        </Detail>
                        <Detail>
                            <span>First transaction:</span>
                            <span>{getDateString(expertData.created * 1000)}</span>
                        </Detail>
                        <Detail>
                            <span>Overall payments volume:</span>
                            <span>
                                {formatBalance(expertData.payments_amount / 1e7, true)} {asset.code}
                            </span>
                        </Detail>
                        <Detail>
                            <span>Overall trading volume:</span>
                            <span>
                                {formatBalance(expertData.traded_amount / 1e7, true, true)}{' '}
                                {asset.code}
                            </span>
                        </Detail>
                        <Detail>
                            <span>Current price:</span>
                            <span>
                                $
                                {formatBalance(
                                    expertData.price7d?.[expertData.price7d.length - 1]?.[1] ?? 0,
                                    true,
                                )}
                            </span>
                        </Detail>
                        <Detail>
                            <span>24h change:</span>
                            <span>{changes24}</span>
                        </Detail>
                    </Details>
                ) : null
            ) : (
                <PageLoader />
            )}
            <Buttons>
                <LinkStyled
                    to={`${MainRoutes.swap}/${getAssetString(asset)}/${getAssetString(
                        asset.code === AQUA_CODE && asset.issuer === AQUA_ISSUER
                            ? StellarService.createLumen()
                            : StellarService.createAsset(AQUA_CODE, AQUA_ISSUER),
                    )}`}
                    onClick={() => close()}
                >
                    <Button isBig>swap</Button>
                </LinkStyled>

                <LinkStyled
                    to={`${MainRoutes.vote}/?base=${getAssetString(asset)}`}
                    onClick={() => close()}
                >
                    <Button isBig>vote</Button>
                </LinkStyled>

                <NoTrustline asset={asset} onlyButton />
            </Buttons>
        </ModalContainer>
    );
};

export default AssetInfoModal;
