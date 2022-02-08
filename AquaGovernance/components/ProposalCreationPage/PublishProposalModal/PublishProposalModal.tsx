import * as React from 'react';
import { ModalDescription, ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import Button from '../../../../common/basics/Button';
import styled from 'styled-components';
import { flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { Breakpoints } from '../../../../common/styles';
import { useEffect, useMemo, useState } from 'react';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import { APPROVED_PROPOSAL_REWARD, CREATE_PROPOSAL_COST } from '../../MainPage/MainPage';
import Select, { Option } from '../../../../common/basics/Select';
import { DAY } from '../ProposalCreation/ProposalCreation';
import Input from '../../../../common/basics/Input';
import { checkProposalStatus, publishProposal } from '../../../api/api';
import { StellarService, ToastService } from '../../../../common/services/globalServices';
import { sha256 } from 'js-sha256';
import { MemoHash } from 'stellar-base';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';
import { useHistory } from 'react-router-dom';
import PaymentInProgressAlert from '../PaymentInProgressAlert/PaymentInProgressAlert';
import ErrorHandler from '../../../../common/helpers/error-handler';
import { LoginTypes } from '../../../../common/store/authStore/types';
import { openApp } from '../../../../common/services/wallet-connect.service';

const Description = styled(ModalDescription)`
    width: 52.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const ProposalCost = styled.div`
    ${flexRowSpaceBetween};
    font-size: 1.6rem;
    padding-bottom: 2.6rem;
    width: 52.8rem;
    margin-bottom: 2.4rem;
    border-bottom: 1px dashed #e8e8ed;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Label = styled.div`
    line-height: 2.8rem;
    color: #6b6c83;
`;

const Amount = styled.div`
    line-height: 2.8rem;
    text-align: right;
    color: #000636;
`;

const SectionDate = styled.div`
    display: flex;
    column-gap: 4.8rem;
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.md)`
         flex-direction: column;
    `}
`;
const DateBlock = styled.div`
    flex: 1 0 0;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 3.2rem;
    `}
`;
const Time = styled.div`
    flex: 1 0 0;
`;

const Options: Option<number>[] = [
    { label: '3 days', value: DAY * 3 },
    { label: '4 days', value: DAY * 4 },
    { label: '5 days', value: DAY * 5 },
    { label: '6 days', value: DAY * 6 },
    { label: '7 days', value: DAY * 7 },
];

const PublishProposalModal = ({ params, close }) => {
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState(DAY * 3);
    const [updateIndex, setUpdateIndex] = useState(0);

    const { account } = useAuthStore();

    const history = useHistory();

    const { proposal } = params;

    const cost = formatBalance(CREATE_PROPOSAL_COST);
    const reward = formatBalance(APPROVED_PROPOSAL_REWARD);

    const isMounted = useIsMounted();

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex((prev) => prev + 1);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const endDate = useMemo(() => Date.now() + period, [updateIndex, period]);

    const checkStatus = (id) => {
        return new Promise((resolve, reject) => {
            async function check() {
                if (!isMounted.current) {
                    reject();
                    return;
                }
                const result = await checkProposalStatus(id);

                if (result.payment_status === 'FINE') {
                    resolve(void 0);
                    return;
                }

                if (result.payment_status === 'HORIZON_ERROR') {
                    return setTimeout(() => check(), 5000);
                }

                reject(result.payment_status);
            }

            check();
        });
    };

    const onSubmit = async () => {
        if (loading) {
            return;
        }

        setLoading(true);

        if (account.authType === LoginTypes.walletConnect) {
            openApp();
        }

        try {
            const op = StellarService.createBurnAquaOperation(CREATE_PROPOSAL_COST.toString());
            const hash = sha256(proposal.text);
            const memoHash = StellarService.createMemo(MemoHash, hash);

            const tx = await StellarService.buildTx(account, op, memoHash);

            const dateNow = new Date().toISOString();
            const dateEnd = new Date(Date.now() + period).toISOString();

            const result = await publishProposal(
                {
                    new_start_at: dateNow,
                    new_end_at: dateEnd,
                    new_transaction_hash: tx.hash().toString('hex'),
                    new_envelope_xdr: tx.toEnvelope().toXDR('base64'),
                },
                proposal.id,
            );

            if (result.payment_status !== 'FINE') {
                ToastService.showErrorToast('The proposal has not been published');
                if (isMounted.current) {
                    setLoading(false);
                }
                return;
            }

            await account.signAndSubmitTx(tx);

            await checkStatus(result.id);

            close();

            ToastService.showSuccessToast('The proposal has been published');

            history.push('/');
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };
    return (
        <>
            <ModalTitle>Publish proposal</ModalTitle>
            <Description>
                To publish a proposal you need pay <b>{cost} AQUA</b>. After publication, you will
                not be able to make changes, in case of acceptance of the proposal, you will receive{' '}
                {reward} AQUA
            </Description>
            <ProposalCost>
                <Label>Proposal publish cost</Label>
                <Amount>{cost} AQUA</Amount>
            </ProposalCost>
            <SectionDate>
                <DateBlock>
                    <Label>Duration of voting</Label>
                    <Select options={Options} value={period} onChange={setPeriod} />
                </DateBlock>
                <Time>
                    <Label>End date</Label>
                    <Input disabled value={getDateString(endDate, { withTime: true })} />
                </Time>
            </SectionDate>
            <Button
                isBig
                fullWidth
                pending={loading}
                onClick={() => {
                    onSubmit();
                }}
            >
                Confirm
            </Button>
            {loading && <PaymentInProgressAlert />}
        </>
    );
};

export default PublishProposalModal;
