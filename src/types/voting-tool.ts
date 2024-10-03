import { ClaimableBalance, Transaction } from 'types/stellar';

export interface Vote extends ClaimableBalance {
    isDownVote: boolean;
    claimBackDate: string;
    assetCode: string;
    assetIssuer: string;
    transactions: () => Promise<Transaction>;
}
