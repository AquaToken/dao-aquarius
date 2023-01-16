import * as React from 'react';
import useAuthStore from '../../../store/authStore/useAuthStore';
import Identicon from '../../../common/basics/Identicon';
import styled from 'styled-components';
import {
    commonMaxWidth,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
} from '../../../common/mixins';
import { Breakpoints, COLORS } from '../../../common/styles';
import { LoginTypes } from '../../../store/authStore/types';
import Copy from '../../../common/assets/img/icon-copy.svg';
import External from '../../../common/assets/img/icon-external-link.svg';
import CopyButton from '../../../common/basics/CopyButton';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const Wrapper = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 5.6rem 4rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem 2rem;
        background: ${COLORS.white};
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
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 3rem;
        align-items: center;
    `}
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
    color: ${COLORS.titleText};

    span:first-child {
        font-weight: 700;
        font-size: 5.6rem;
        line-height: 6.4rem;
        margin-bottom: 0.4rem;
    }

    ${respondDown(Breakpoints.md)`
        align-items: center;
        
        span:first-child {
            font-size: 2rem;
            line-height: 2.2rem;
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
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 2.4rem;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all ease 200ms;
    z-index: 1;
    padding: 0 1.8rem;
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 2rem;

    &:hover {
        background-color: ${COLORS.lightGray};
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
                            href={`https://stellar.expert/explorer/public/account/${account.accountId()}`}
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
        </Container>
    );
};

export default AccountInfo;
