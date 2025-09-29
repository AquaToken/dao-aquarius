import * as React from 'react';
import styled from 'styled-components';

import { getIsTestnetEnv } from 'helpers/env';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import {
    cardBoxShadow,
    commonMaxWidth,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
} from 'web/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'web/styles';

import Copy from 'assets/icons/actions/icon-copy-16.svg';
import External from 'assets/icons/nav/icon-external-link-16.svg';
import MyAquarius from 'assets/profile-page/my-aquarius.svg';

import CopyButton from 'basics/buttons/CopyButton';
import Identicon from 'basics/Identicon';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const BgContainer = styled.div`
    ${flexAllCenter};
    flex-direction: column;
    width: 100%;
    position: relative;
    overflow: hidden;
    background: ${COLORS.purple700};
    padding-bottom: 5rem;
`;

const MyAquariusLogo = styled(MyAquarius)`
    width: 100%;
    position: absolute;
    display: block;

    ${respondDown(Breakpoints.md)`
        width: unset;
        height: 100%;
    `};
`;

const Wrapper = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 3.2rem 4rem;
    z-index: 1;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem 2rem;
    `}
`;

const Main = styled.div`
    ${flexRowSpaceBetween};

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const AccountInfoBLock = styled.div`
    display: flex;
    align-items: center;
    gap: 3.2rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        margin-bottom: 3rem;
        align-items: center;
        gap: 1.6rem;
    `};
`;

const Icon = styled.div`
    height: 4.8rem;
    width: 4.8rem;
    ${flexAllCenter};
    position: relative;
    margin-bottom: 1rem;
`;

const WcIcon = styled.img`
    position: absolute;
    height: 1.6rem;
    width: 1.6rem;
    right: 0;
    bottom: 0;
    border-radius: 50%;
`;

const AccountData = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.white};

    span:first-child {
        font-weight: 700;
        ${FONT_SIZE.xl};
        margin-bottom: 0.4rem;
    }

    ${respondDown(Breakpoints.md)`
        align-items: center;
        
        span:first-child {
            ${FONT_SIZE.lg};
        }
    `}
`;

const CopyWrap = styled.span`
    display: flex;
    align-items: center;
    gap: 1.5rem;

    a {
        text-decoration: none;
    }
`;

const ExternalLogo = styled(External)`
    margin-left: 4rem;
`;

const ButtonBlock = styled.div`
    ${flexAllCenter};
    min-width: 4.8rem;
    height: 4.8rem;
    background-color: ${COLORS.white};
    ${cardBoxShadow};
    border-radius: 2.4rem;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all ease 200ms;
    z-index: 1;
    padding: 0 1.8rem;
    color: ${COLORS.textGray};
    font-size: 1.4rem;
    line-height: 2rem;

    &:hover {
        background-color: ${COLORS.gray50};
    }

    &:active {
        transform: scale(0.9);
    }
`;

const AccountInfo = () => {
    const { account, federationAddress, loginType, metadata } = useAuthStore();

    const truncatedKey = `${account.accountId().slice(0, 8)}...${account.accountId().slice(-8)}`;

    return (
        <Container>
            <BgContainer>
                <MyAquariusLogo />
                <Wrapper>
                    <Main>
                        <AccountInfoBLock>
                            <Icon>
                                <Identicon pubKey={account.accountId()} />
                                {loginType === LoginTypes.walletConnect && (
                                    <WcIcon src={metadata.icons[0]} />
                                )}
                            </Icon>
                            <AccountData>
                                {federationAddress && <span>{federationAddress}</span>}
                                <span>{truncatedKey}</span>
                            </AccountData>
                        </AccountInfoBLock>

                        <CopyWrap>
                            <a
                                target="_blank"
                                href={`https://stellar.expert/explorer/${
                                    getIsTestnetEnv() ? 'testnet' : 'public'
                                }/account/${account.accountId()}`}
                                rel="noreferrer"
                            >
                                <ButtonBlock>
                                    Explorer
                                    <ExternalLogo />
                                </ButtonBlock>
                            </a>

                            <CopyButton text={account.accountId()} withoutLogo>
                                <ButtonBlock>
                                    <Copy />
                                </ButtonBlock>
                            </CopyButton>
                        </CopyWrap>
                    </Main>
                </Wrapper>
            </BgContainer>
        </Container>
    );
};

export default AccountInfo;
