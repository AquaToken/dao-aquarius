import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
    commonMaxWidth,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
} from '../../../common/mixins';
import AssetDropdown from '../../vote/components/AssetDropdown/AssetDropdown';
import { Breakpoints, COLORS } from '../../../common/styles';
import useAuthStore from '../../../store/authStore/useAuthStore';
import {
    ModalService,
    SorobanService,
    StellarService,
    ToastService,
} from '../../../common/services/globalServices';
import PageLoader from '../../../common/basics/PageLoader';
import Input from '../../../common/basics/Input';
import SwapIcon from '../../../common/assets/img/icon-arrows-circle.svg';
import SettingsIcon from '../../../common/assets/img/icon-settings.svg';
import Plus from '../../../common/assets/img/icon-plus.svg';
import Info from '../../../common/assets/img/icon-info.svg';
import Revert from '../../../common/assets/img/icon-revert.svg';
import { useDebounce } from '../../../common/hooks/useDebounce';
import Button from '../../../common/basics/Button';
import { IconFail } from '../../../common/basics/Icons';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import { formatBalance, getAssetFromString, getAssetString } from '../../../common/helpers/helpers';
import SwapConfirmModal from '../components/SwapConfirmModal/SwapConfirmModal';
import SwapSettingsModal from '../components/SwapSettingsModal/SwapSettingsModal';
import { findSwapPath } from '../../amm/api/api';
import Asset from '../../vote/components/AssetDropdown/Asset';
import { BuildSignAndSubmitStatuses } from '../../../common/services/wallet-connect.service';
import ErrorHandler from '../../../common/helpers/error-handler';
import { useHistory, useParams } from 'react-router-dom';
import { MainRoutes } from '../../../routes';
import { AQUA_CODE, AQUA_ISSUER } from '../../../common/services/stellar.service';
import Tooltip, { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';
import MainNetWarningModal, {
    SHOW_PURPOSE_ALIAS_MAIN_NET,
} from '../../../common/modals/MainNetWarningModal';
import AmountUsdEquivalent from '../components/AmountUsdEquivalent/AmountUsdEquivalent';

const Container = styled.main`
    background-color: ${COLORS.lightGray};
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;
    padding-bottom: 8rem;
`;

const Content = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 6.3rem 4rem 0;

    ${respondDown(Breakpoints.md)`
        padding: 4rem 1.6rem 0;
    `}
`;

const Header = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 4.8rem;
`;

export const Title = styled.h2`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    font-weight: 400;

    ${respondDown(Breakpoints.md)`
        font-size: 2.8rem;
   `}
`;

const Form = styled.div`
    margin: 0 auto;
    width: 75rem;
    border-radius: 1rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem 0 rgba(0, 6, 54, 0.06);
    padding: 6.4rem 4.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        padding: 1.6rem;
        position: relative;
    `}
`;

const FormRow = styled.div<{ $isOpen?: boolean }>`
    display: flex;
    margin-top: 5rem;
    position: relative;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 2rem;
        position: ${({ $isOpen }) => ($isOpen ? 'static' : 'relative')};
    `}
`;

const Balance = styled.div<{ isHidden?: boolean }>`
    visibility: ${({ isHidden }) => (isHidden ? 'hidden' : 'unset')};
    position: absolute;
    bottom: calc(100% + 1.2rem);
    right: 0;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
    display: inline-flex;
    align-items: center;

    svg {
        margin-left: 0.4rem;
    }

    ${respondDown(Breakpoints.md)`
       font-size: 1.2rem;
    `}
`;

const BalanceClickable = styled.span`
    color: ${COLORS.purple};
    cursor: pointer;
    margin-left: 0.4rem;
`;

const StyledInput = styled(Input)`
    flex: 1.4;
    z-index: 50;
`;

const DropdownContainer = styled.div<{ $isOpen: boolean }>`
    ${({ $isOpen }) =>
        $isOpen
            ? `
    width: 100%; 
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    `
            : `flex: 1;`}
`;

const SwapDivider = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 3rem 0 4rem;
    height: 4.8rem;

    ${respondDown(Breakpoints.md)`
       margin: 1rem 0 0;
    `}
`;

const StyledButton = styled(Button)`
    margin-top: 4.8rem;
    margin-left: auto;
    width: 45%;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        margin-top: 2rem;
    `}
`;

const Error = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
`;

const RevertButton = styled.div`
    cursor: pointer;
    padding: 1rem;
    border-radius: 0.3rem;
    ${flexAllCenter};

    &:hover {
        background-color: ${COLORS.lightGray};
    }
`;

const Prices = styled.div`
    color: ${COLORS.grayText};
    margin-top: 3rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    cursor: pointer;

    svg {
        margin-left: 0.6rem;
    }
`;

const SettingsButton = styled.div`
    ${flexAllCenter};
    border-radius: 0.3rem;
    padding: 1rem;
    cursor: pointer;

    &:hover {
        background-color: ${COLORS.lightGray};
    }
`;

const TrustlineBlock = styled.div`
    display: flex;
    flex-direction: column;
    padding: 3.2rem;
    background-color: ${COLORS.lightGray};
    margin-top: 1.6rem;
    border-radius: 0.6rem;

    p {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.grayText};
    }
`;

const TrustlineBlockTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 2.8rem;
`;

const TrustlineButton = styled(Button)`
    width: fit-content;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        margin-top: 2rem;
    `}
    svg {
        margin-left: 0.8rem;
    }
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.white};
    font-size: 1.2rem;
    line-height: 2rem;
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 1.2rem;

    &:last-child:not(:first-child) {
        font-weight: 700;
    }
`;

const SwapPage = () => {
    const { account, isLogged } = useAuthStore();

    const [base, setBase] = useState(null);
    const [isBaseDropdownOpen, setIsBaseDropdownOpen] = useState(false);
    const [counter, setCounter] = useState(null);
    const [isCounterDropdownOpen, setIsCounterDropdownOpen] = useState(false);
    const [error, setError] = useState(false);

    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState('');
    const [bestPathXDR, setBestPathXDR] = useState(null);
    const [bestPath, setBestPath] = useState(null);
    const [bestPools, setBestPools] = useState(null);
    const [estimatePending, setEstimatePending] = useState(false);
    const [trustlinePending, setTrustlinePending] = useState(false);

    const [isPriceReverted, setIsPriceReverted] = useState(false);

    const debouncedAmount = useDebounce(baseAmount, 700);

    const params = useParams<{ source: string; destination: string }>();
    const history = useHistory();

    useEffect(() => {
        const { source, destination } = params;

        if (source === destination) {
            history.replace(
                `${MainRoutes.swap}/${getAssetString(
                    StellarService.createLumen(),
                )}/${getAssetString(StellarService.createAsset(AQUA_CODE, AQUA_ISSUER))}`,
            );
            return;
        }

        setBase(getAssetFromString(source));
        setCounter(getAssetFromString(destination));
    }, [params]);

    useEffect(() => {
        if (!!Number(debouncedAmount.current)) {
            setEstimatePending(true);

            findSwapPath(
                SorobanService.getAssetContractId(base),
                SorobanService.getAssetContractId(counter),
                debouncedAmount.current,
            )
                .then((res) => {
                    if (!res.success) {
                        setError(true);
                        setEstimatePending(false);
                    } else {
                        setError(false);
                        setEstimatePending(false);
                        if (!baseAmount) {
                            return;
                        }
                        setCounterAmount((Number(res.amount) / 1e7).toFixed(7));
                        setBestPathXDR(res.swap_chain_xdr);
                        setBestPath(res.tokens);
                        setBestPools(res.pools);
                    }
                })
                .catch(() => {
                    setError(true);
                    setEstimatePending(false);
                });
        } else {
            setBestPathXDR(null);
            setBestPath(null);
            setBestPools(null);
            setCounterAmount('');
        }
    }, [debouncedAmount, base, counter]);

    useEffect(() => {
        setCounterAmount('');
    }, [baseAmount, base, counter]);

    const swapAssets = () => {
        if (!isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {});
        }
        if (!counterAmount || !baseAmount) {
            return;
        }
        ModalService.openModal(SwapConfirmModal, {
            base,
            counter,
            baseAmount,
            counterAmount,
            bestPathXDR,
            bestPath,
            bestPools,
        }).then(({ isConfirmed }) => {
            if (isConfirmed) {
                setBaseAmount('');
                setCounterAmount('');
                setBestPathXDR(null);
                setBestPath(null);
                setBestPools(null);
                setIsPriceReverted(false);
            }
        });
    };

    const submitWithWarning = () => {
        const showPurpose = JSON.parse(localStorage.getItem(SHOW_PURPOSE_ALIAS_MAIN_NET) || 'true');
        if (showPurpose) {
            ModalService.openModal(MainNetWarningModal, {}, false).then(({ isConfirmed }) => {
                if (isConfirmed) {
                    swapAssets();
                }
            });
            return;
        }
        swapAssets();
    };

    const onAmountChange = (value) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        const [integerPart, fractionalPart] = value.split('.');
        const roundedValue =
            fractionalPart && fractionalPart.length > 7
                ? `${integerPart}.${fractionalPart.slice(0, 7)}`
                : value;

        setBaseAmount(roundedValue);
    };

    const revertAssets = () => {
        history.push(`${MainRoutes.swap}/${getAssetString(counter)}/${getAssetString(base)}`);
        setBaseAmount('');
        setCounterAmount('');
        setBestPathXDR(null);
        setBestPath(null);
        setBestPools(null);
        setIsPriceReverted(false);
    };

    const addTrust = async () => {
        setTrustlinePending(true);
        try {
            const op = StellarService.createAddTrustOperation(counter);

            const tx = await StellarService.buildTx(account, op);

            const result = await account.signAndSubmitTx(tx);

            if (
                (result as { status: BuildSignAndSubmitStatuses })?.status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Trusline added successfully');
            setTrustlinePending(false);
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            setTrustlinePending(false);
        }
    };

    const setSource = (asset) => {
        history.push(`${MainRoutes.swap}/${getAssetString(asset)}/${getAssetString(counter)}`);
    };

    const setDestination = (asset) => {
        history.push(`${MainRoutes.swap}/${getAssetString(base)}/${getAssetString(asset)}`);
    };

    if (!base || !counter) {
        return <PageLoader />;
    }

    return (
        <Container>
            <Content>
                <Form>
                    <Header>
                        <Title>Swap assets</Title>
                        <SettingsButton
                            onClick={() => ModalService.openModal(SwapSettingsModal, {})}
                        >
                            <SettingsIcon />
                        </SettingsButton>
                    </Header>
                    <FormRow>
                        {account && account.getAssetBalance(base) !== null && (
                            <Balance>
                                Available:
                                <BalanceClickable
                                    onClick={() =>
                                        setBaseAmount(
                                            account.getAvailableForSwapBalance(base).toFixed(7),
                                        )
                                    }
                                >
                                    {' '}
                                    {formatBalance(account.getAvailableForSwapBalance(base))}{' '}
                                    {base.code}
                                </BalanceClickable>
                                <Tooltip
                                    showOnHover
                                    isDark
                                    position={
                                        +window.innerWidth < 992
                                            ? TOOLTIP_POSITION.left
                                            : TOOLTIP_POSITION.right
                                    }
                                    content={
                                        <TooltipInner>
                                            {account
                                                .getReservesForSwap(base)
                                                .map(({ label, value }) => (
                                                    <TooltipRow key={label}>
                                                        <span>{label}</span>
                                                        <span>
                                                            {value} {base.code}
                                                        </span>
                                                    </TooltipRow>
                                                ))}
                                        </TooltipInner>
                                    }
                                >
                                    <Info />
                                </Tooltip>
                            </Balance>
                        )}
                        <StyledInput
                            value={baseAmount}
                            onChange={(e) => onAmountChange(e.target.value)}
                            label="From"
                            postfix={
                                Boolean(baseAmount) ? (
                                    <AmountUsdEquivalent
                                        amount={debouncedAmount.current}
                                        asset={base}
                                    />
                                ) : null
                            }
                        />

                        <DropdownContainer $isOpen={isBaseDropdownOpen}>
                            <AssetDropdown
                                asset={base}
                                onUpdate={setSource}
                                exclude={counter}
                                disabled={estimatePending}
                                withoutReset
                                onToggle={(res) => setIsBaseDropdownOpen(res)}
                                withBalances
                                longListOnMobile
                            />
                        </DropdownContainer>
                    </FormRow>

                    <SwapDivider>
                        {estimatePending ? (
                            <PageLoader />
                        ) : (
                            <RevertButton onClick={() => revertAssets()}>
                                <SwapIcon />
                            </RevertButton>
                        )}
                    </SwapDivider>

                    <FormRow $isOpen={isCounterDropdownOpen}>
                        {account && account.getAssetBalance(counter) !== null && (
                            <Balance isHidden={isCounterDropdownOpen && +window.innerWidth < 992}>
                                Balance: {formatBalance(account.getAssetBalance(counter))}{' '}
                                {counter.code}
                            </Balance>
                        )}
                        <StyledInput
                            value={counterAmount}
                            label="To(estimated)"
                            placeholder="0.0"
                            postfix={
                                <AmountUsdEquivalent
                                    amount={counterAmount}
                                    asset={counter}
                                    sourceAmount={baseAmount}
                                    sourceAsset={base}
                                />
                            }
                            disabled
                        />

                        <DropdownContainer $isOpen={isCounterDropdownOpen}>
                            <AssetDropdown
                                asset={counter}
                                onUpdate={setDestination}
                                exclude={base}
                                withoutReset
                                disabled={estimatePending}
                                onToggle={(res) => setIsCounterDropdownOpen(res)}
                                withBalances
                                longListOnMobile
                            />
                        </DropdownContainer>
                    </FormRow>

                    {baseAmount && counterAmount && !estimatePending && (
                        <Prices onClick={() => setIsPriceReverted((prevState) => !prevState)}>
                            {isPriceReverted
                                ? `1 ${counter.code} = ${formatBalance(
                                      +baseAmount / +counterAmount,
                                  )} ${base.code}`
                                : `1 ${base.code} = ${formatBalance(
                                      +counterAmount / +baseAmount,
                                  )} ${counter.code}`}
                            <Revert />
                        </Prices>
                    )}

                    {error && (
                        <Error>
                            <IconFail />
                            There are no exchange paths for the selected pair.
                        </Error>
                    )}

                    {account && account.getAssetBalance(counter) === null && (
                        <TrustlineBlock>
                            <TrustlineBlockTitle>
                                <Asset asset={counter} onlyLogo />{' '}
                                <span>{counter.code} trustline missing</span>
                            </TrustlineBlockTitle>
                            <p>
                                You can't receive the {counter.code} asset because you haven't added
                                this trustline. Please add the {counter.code} trustline to continue
                                the transaction.
                            </p>
                            <TrustlineButton onClick={() => addTrust()} pending={trustlinePending}>
                                add {counter.code} trustline <Plus />
                            </TrustlineButton>
                        </TrustlineBlock>
                    )}

                    <StyledButton
                        isBig
                        disabled={
                            estimatePending ||
                            !counterAmount ||
                            (account && account.getAssetBalance(counter) === null) ||
                            (account && account.getAssetBalance(base) === null)
                        }
                        onClick={() => submitWithWarning()}
                    >
                        SWAP ASSETS
                    </StyledButton>
                </Form>
            </Content>
        </Container>
    );
};

export default SwapPage;
