import { StellarToml } from '@stellar/stellar-sdk';
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { getAssetDetails } from 'api/stellar-expert';

import { ExpertAssetData } from 'types/api-stellar-expert';

import Changes24 from 'basics/Changes24';

import Asset from '../../../pages/vote/components/AssetDropdown/Asset';
import { MainRoutes } from '../../../routes';
import useAssetsStore from '../../../store/assetsStore/useAssetsStore';
import Mail from 'assets/email16.svg';
import Git from 'assets/github16.svg';
import External from 'assets/icon-external-link-black.svg';
import X from 'assets/twitter16.svg';
import Button from '../../basics/Button';
import PageLoader from '../../basics/PageLoader';
import NoTrustline from '../../components/NoTrustline/NoTrustline';
import { formatBalance, getAssetString, getDateString } from '../../helpers/helpers';
import { respondDown } from '../../mixins';
import { StellarService } from '../../services/globalServices';
import { AQUA_CODE, AQUA_ISSUER } from '../../services/stellar.service';
import { Breakpoints, COLORS } from '../../styles';
import { ModalContainer } from '../atoms/ModalAtoms';

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

const Buttons = styled.div`
    display: flex;
    margin-top: 3.2rem;
    gap: 1.2rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const LinkStyled = styled(Link)`
    display: flex;
    flex: 1;
    text-decoration: none;

    Button {
        width: 100%;
        flex: 1;
    }
`;

const AssetInfoModal = ({ params, close }) => {
    const { asset } = params;

    const [tomlInfo, setTomlInfo] = useState<StellarToml.Api.StellarToml>({});
    const [expertData, setExpertData] = useState<ExpertAssetData>(undefined);

    const { assetsInfo } = useAssetsStore();

    const { desc, home_domain } = assetsInfo.get(getAssetString(asset)) || {};

    useEffect(() => {
        StellarToml.Resolver.resolve(home_domain)
            .then(res => {
                setTomlInfo(res);
            })
            .catch(() => {
                setTomlInfo({});
            });

        getAssetDetails(asset)
            .then(details => {
                setExpertData(details);
            })
            .catch(() => {
                setExpertData(null);
            });
    }, []);

    const xLink = useMemo(() => {
        if (!tomlInfo?.DOCUMENTATION?.ORG_TWITTER) {
            return null;
        }

        if (!tomlInfo?.DOCUMENTATION?.ORG_TWITTER.startsWith('https://')) {
            return tomlInfo?.DOCUMENTATION?.ORG_TWITTER;
        }
        return tomlInfo?.DOCUMENTATION?.ORG_TWITTER.split('/')[3];
    }, [tomlInfo]);

    const gitLink = useMemo(() => {
        if (!tomlInfo?.DOCUMENTATION?.ORG_GITHUB) {
            return null;
        }

        if (!tomlInfo?.DOCUMENTATION?.ORG_GITHUB.startsWith('https://')) {
            return tomlInfo?.DOCUMENTATION?.ORG_GITHUB;
        }
        return tomlInfo?.DOCUMENTATION?.ORG_GITHUB.split('/')[3];
    }, [tomlInfo]);

    return (
        <ModalContainer isWide>
            <Asset asset={asset} isBig hasDomainLink />
            <Description>{desc}</Description>
            <Links>
                {xLink && (
                    <ContactLink target="_blank" href={`https://x.com/${xLink}`}>
                        <X />
                        {xLink}
                    </ContactLink>
                )}
                {gitLink && (
                    <ContactLink target="_blank" href={`https://github.com/${gitLink}`}>
                        <Git />
                        {gitLink}
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
                expertData ? (
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
                            <Changes24 expertData={expertData} />
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
