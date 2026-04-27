import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { isIceApprovalRequired, processIceTx } from 'api/ice';

import { GD_ICE_CODE, GOV_ICE_CODE } from 'constants/assets-env';
import { VoteOptions } from 'constants/dao';
import { AppRoutes } from 'constants/routes';

import { getEnvClassicAssetData } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance, roundToPrecision } from 'helpers/format-number';
import { createAsset } from 'helpers/token';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { StellarService, ToastService } from 'services/globalServices';

import { Proposal } from 'types/governance';
import { ModalProps } from 'types/modal';

import { AssetRegistryBadgeVariant } from 'web/pages/asset-registry/pages/AssetRegistryMainPage/AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from 'web/pages/asset-registry/pages/AssetRegistryMainPage/components/AssetRegistryStatusBadge/AssetRegistryStatusBadge';

import DIce from 'assets/tokens/dice-logo.svg';
import Ice from 'assets/tokens/ice-logo.svg';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import { VoteIcon } from 'basics/icons';
import Input from 'basics/inputs/Input';
import RangeInput from 'basics/inputs/RangeInput';
import Select from 'basics/inputs/Select';
import { ExternalLink } from 'basics/links';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import { flexAllCenter, flexRowSpaceBetween } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const MINIMUM_ICE_AMOUNT = 10;

const ContentRow = styled.div`
    ${flexRowSpaceBetween};
    margin-top: 3rem;

    &:first-child {
        margin-top: 7.2rem;
    }
`;

const AssetRow = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
    align-items: flex-start;
    margin-top: 3rem;
`;

const AssetWrap = styled.div`
    min-width: 0;
    flex: 1 1 auto;
`;

const Label = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textTertiary};
    ${flexAllCenter};
    gap: 0.5rem;
`;

const BalanceBlock = styled.span`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.textGray};
`;

const Balance = styled.span`
    color: ${COLORS.purple400};
    cursor: pointer;
`;

const IceLogo = styled(Ice)`
    margin-right: 0.8rem;
    height: 3.2rem;
    width: 3.2rem;
`;
const DIceLogo = styled(DIce)`
    margin-right: 0.8rem;
    height: 3.2rem;
    width: 3.2rem;
`;

const StyledInput = styled(Input)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
    flex: 3;
`;

const StyledSelect = styled(Select)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
    flex: 2;
`;

const ClaimBack = styled.div`
    margin-top: 4.1rem;
    padding-bottom: 1.7rem;
    color: ${COLORS.textGray};
    border-bottom: 0.1rem dashed ${COLORS.gray100};
`;

const ClaimBackDate = styled.span`
    color: ${COLORS.textTertiary};
`;

const StyledButton = styled(Button)`
    margin-top: 3.2rem;
`;

const GetAquaBlock = styled.div`
    ${flexRowSpaceBetween};
    height: 6.8rem;
    border-radius: 1rem;
    background: ${COLORS.gray50};
    padding: 0 3.2rem;
    margin-top: 4.1rem;
`;

const GetAquaLabel = styled.span`
    color: ${COLORS.textGray};
`;

const ConfirmVoteModal = ({
    params,
    close,
}: ModalProps<{
    option: VoteOptions;
    key: string;
    endDate: string;
    startDate: string;
    proposal?: Proposal;
}>) => {
    const { account } = useAuthStore();
    const { option, key, endDate, proposal } = params;

    const isMounted = useIsMounted();

    const [percent, setPercent] = useState(0);
    const [amount, setAmount] = useState('');
    const [pending, setPending] = useState(false);
    const { asset: governIceStellarAsset } = useMemo(() => getEnvClassicAssetData('governIce'), []);
    const { asset: gdIceStellarAsset } = useMemo(() => getEnvClassicAssetData('gdIce'), []);
    const [targetAsset, setTargetAsset] = useState(governIceStellarAsset);

    const options = useMemo(
        () => [{ label: GOV_ICE_CODE, value: governIceStellarAsset, icon: <IceLogo /> }],
        [governIceStellarAsset],
    );
    const extendedOptions = useMemo(
        () => [...options, { label: GD_ICE_CODE, value: gdIceStellarAsset, icon: <DIceLogo /> }],
        [gdIceStellarAsset, options],
    );

    const targetBalance = useMemo(
        () => account?.getAssetBalance(targetAsset),
        [account, targetAsset],
    );

    const hasTrustLine = targetBalance !== null && targetBalance !== undefined;
    const hasTargetBalance = Number(targetBalance) > 0;
    const isAssetProposal =
        proposal?.proposal_type === 'ADD_ASSET' || proposal?.proposal_type === 'REMOVE_ASSET';
    const proposalAsset =
        isAssetProposal && proposal?.asset_code
            ? createAsset(proposal.asset_code, proposal.asset_issuer ?? '')
            : null;

    const formattedBalance = hasTrustLine ? formatBalance(Number(targetBalance)) : null;

    const unlockDate = new Date(endDate).getTime() + 60 * 60 * 1000;

    const hasGDIce = account ? account.getAssetBalance(gdIceStellarAsset) !== null : false;

    useEffect(() => {
        setAmount('');
        setPercent(0);
    }, [targetAsset]);

    const onRangeChange = percent => {
        setPercent(percent);

        const amountValue = (targetBalance * percent) / 100;

        setAmount(roundToPrecision(amountValue, 7));
    };

    const onInputChange = value => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        setAmount(value);

        const percentValue = roundToPrecision((Number(value) / Number(targetBalance)) * 100, 2);

        setPercent(+percentValue);
    };

    const onSubmit = async () => {
        if (pending) {
            return;
        }
        if (Number(amount) > Number(targetBalance)) {
            ToastService.showErrorToast(
                `The value must be less or equal than ${formattedBalance} ${targetAsset.code}`,
            );
            return;
        }
        if (Number(amount) < MINIMUM_ICE_AMOUNT) {
            ToastService.showErrorToast(
                `The value must be greater than ${MINIMUM_ICE_AMOUNT} ${targetAsset.code}`,
            );
            return;
        }
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        try {
            setPending(true);
            const voteOp = StellarService.op.createVoteOperation(
                account.accountId(),
                key,
                amount,
                unlockDate,
                targetAsset,
            );
            const tx = await StellarService.tx.buildTx(account, voteOp);
            const processedTx = isIceApprovalRequired(targetAsset)
                ? await processIceTx(tx, targetAsset)
                : tx;
            const result = await account.signAndSubmitTx(processedTx);
            if (isMounted.current) {
                setPending(false);
                close();
            }

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Your vote has been cast');
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setPending(false);
            }
        }
    };

    return (
        <ModalWrapper>
            <ModalTitle>Confirm vote</ModalTitle>
            <ModalDescription>
                Your ICE will be locked until the voting ends. Please check the details carefully.
            </ModalDescription>
            {proposalAsset ? (
                <AssetRow>
                    <AssetWrap>
                        <Asset asset={proposalAsset} variant="compactDomain" />
                    </AssetWrap>
                    <AssetRegistryStatusBadge
                        variant={
                            proposal?.proposal_type === 'ADD_ASSET'
                                ? AssetRegistryBadgeVariant.whitelisted
                                : AssetRegistryBadgeVariant.revoked
                        }
                        label={proposal?.proposal_type === 'ADD_ASSET' ? 'Whitelist' : 'Revoke'}
                        withIcon
                    />
                </AssetRow>
            ) : null}
            <ContentRow>
                <Label>Your vote:</Label>
                <Label>
                    <VoteIcon option={option} />
                    <span>{option}</span>
                </Label>
            </ContentRow>

            <ContentRow>
                <Label>Voting power</Label>

                {hasTrustLine ? (
                    <BalanceBlock>
                        <Balance onClick={() => onRangeChange(100)}>
                            {formattedBalance} {targetAsset.code}{' '}
                        </Balance>
                        available
                    </BalanceBlock>
                ) : (
                    <BalanceBlock>You don&apos;t have {targetAsset.code} trustline</BalanceBlock>
                )}
            </ContentRow>

            <ContentRow>
                <StyledInput
                    value={amount}
                    onChange={e => {
                        onInputChange(e.target.value);
                    }}
                    placeholder="Enter amount"
                    disabled={!hasTrustLine || !hasTargetBalance}
                    inputMode="decimal"
                />

                <StyledSelect
                    options={hasGDIce ? extendedOptions : options}
                    value={targetAsset}
                    onChange={setTargetAsset}
                    disabled={!hasGDIce}
                />
            </ContentRow>

            <RangeInput
                onChange={onRangeChange}
                value={percent}
                disabled={!hasTrustLine || !hasTargetBalance}
            />

            {hasTrustLine && hasTargetBalance ? (
                <ClaimBack>
                    You will be able to claim back your {targetAsset.code} on{' '}
                    <ClaimBackDate>{getDateString(unlockDate, { withTime: true })}</ClaimBackDate>
                </ClaimBack>
            ) : (
                <GetAquaBlock>
                    <GetAquaLabel>You don&apos;t have enough {targetAsset.code}</GetAquaLabel>

                    <ExternalLink asDiv>
                        <Link to={AppRoutes.section.locker.link.index}>Get ICE</Link>
                    </ExternalLink>
                </GetAquaBlock>
            )}

            <StyledButton
                fullWidth
                onClick={() => onSubmit()}
                disabled={!amount || !Number(amount)}
                pending={pending}
            >
                SUBMIT VOTE
            </StyledButton>
        </ModalWrapper>
    );
};

export default ConfirmVoteModal;
