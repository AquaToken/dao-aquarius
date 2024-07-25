// https://developers.stellar.org/docs/glossary/transactions/#result-codes
import { LEDGER_CANCEL_ERROR } from '../services/ledger.service';

enum TRANSACTIONS_ERROR_CODES {
    // TODO: Add this codes
    // | 'txFeeBumpInnerSuccess'
    // | 'txFailed'
    // | 'txBadMinSeqAgeOrGap'
    // | 'txMalformed'
    // | 'txSorobanInvalid';
    'tx_too_early' = 'Ledger closeTime before minTime value in the transaction.',
    'tx_too_late' = 'Ledger closeTime after maxTime value in the transaction.',
    'tx_missing_operation' = 'No operation was specified.',
    'tx_bad_seq' = 'Transaction failed because sequence got out of sync. Please reload and try again.',
    'tx_bad_auth' = 'Too few valid signatures / wrong network.',
    'tx_insufficient_balance' = 'Fee would bring account below minimum reserve.',
    'tx_no_account' = 'Source account not found.',
    'tx_insufficient_fee' = 'Fee is too small.',
    'tx_bad_auth_extra' = 'Unused signatures attached to transaction.',
    'tx_internal_error' = 'An unknown error occurred.',
    'tx_not_supported' = 'The transaction type is not supported.',
    'tx_fee_bump_inner_failed' = 'The fee bump inner transaction failed.',
    'tx_bad_sponsorship' = 'The sponsorship is not confirmed.',
}

// https://developers.stellar.org/api/errors/result-codes/operation-specific/
enum OPERATIONS_ERROR_CODES {
    'op_bad_auth' = 'There are too few valid signatures, or the transaction was submitted to the wrong network.',
    'op_no_source_account' = 'The source account was not found.',
    'op_not_supported' = 'The operation is not supported at this time.',
    'op_too_many_subentries' = 'Max number of subentries (1000) already reached',
    'op_exceeded_work_limit' = 'Operation did too much work',
    'op_malformed' = 'The input to the payment or the destination is invalid.',
    'op_low_reserve' = 'Your account does not have enough XLM to meet the minimum balance.',
    'op_underfunded' = 'Transaction failed due to a lack of funds.',
    'op_already_exist' = 'The destination account already exists',
    'op_src_no_trust' = 'The source account does not trust the issuer of the asset it is trying to send.',
    'op_src_not_authorized' = 'The source account is not authorized to send this payment.',
    'op_no_destination' = 'The receiving account does not exist.',
    'op_no_trust' = 'Destination does not have a trust line.',
    'op_not_authorized' = 'The destination account is not authorized to hold this asset.',
    'op_line_full' = 'The destination account (receiver) does not have sufficient limits to receive amount and still satisfy its buying liabilities.',
    'op_no_issuer' = 'The issuer of the asset does not exist.',
    'op_too_few_offers' = 'There is no path of offers connecting the send asset and destination asset. Stellar only considers paths of length 5 or shorter.',
    'op_cross_self' = 'This path payment would cross one of its own offers or the account has opposite offer of equal or lesser price active, so the account creating this offer would immediately cross itself.',
    'op_over_source_max' = 'The paths that could send destination amount of destination asset would exceed send max.',
    'op_under_dest_min' = 'The paths that could send destination amount of destination asset would fall short of destination min.',
    'op_sell_no_trust' = 'The account creating the offer does not have a trustline for the asset it is selling.',
    'op_buy_no_trust' = 'The account creating the offer does not have a trustline for the asset it is buying.',
    'sell_not_authorized' = 'The account creating the offer is not authorized to buy this asset.',
    'buy_not_authorized' = 'The account creating the offer is not authorized to buy this asset.',
    'op_sell_no_issuer' = 'The issuer of selling asset does not exist.',
    'buy_no_issuer' = 'The issuer of buying asset does not exist.',
    'op_offer_not_found' = 'An offer with some offerID cannot be found.',
    'op_too_many_signers' = '20 is the maximum number of signers an account can have, and adding another signer would exceed that.',
    'op_bad_flags' = 'The flags set and/or cleared are invalid by themselves or in combination.',
    'op_invalid_inflation' = 'The destination account set in the inflation field does not exist.',
    'op_cant_change' = 'This account can no longer change the option it wants to change.',
    'op_unknown_flag' = 'The account is trying to set a flag that is unknown.',
    'op_threshold_out_of_range' = 'The value for a key weight or threshold is invalid.',
    'op_bad_signer' = 'Any additional signers added to the account cannot be the master key.',
    'op_invalid_home_domain' = 'Home domain is malformed.',
    'op_invalid_limit' = 'The limit is not sufficient to hold the current balance of the trustline and still satisfy its buying liabilities.',
    'op_self_not_allowed' = 'The source account attempted to create a trustline for itself, which is not allowed.',
    'op_no_trust_line' = 'The trustor does not have a trustline with the issuer performing this operation.',
    'op_no_trustline' = 'The trustor does not have a trustline with the issuer performing this operation.',
    'op_not_required' = 'The source account (issuer performing this operation) does not require trust. In other words, it does not have to have the flag AUTH_REQUIRED_FLAG set.',
    'op_cant_revoke' = 'The source account is trying to revoke the trustline of the trustor, but it cannot do so.',
    'op_no_account' = 'The destination account does not exist.',
    'op_immutable_set' = 'The source account has AUTH_IMMUTABLE flag set.',
    'op_has_sub_entries' = 'The source account has trust lines/offers.',
    'op_seqnum_too_far' = 'Source account sequence number is too high.',
    'op_dest_full' = 'The destination account cannot receive the balance of the source account and still satisfy its lumen buying liabilities.',
    'op_data_name_not_found' = 'Trying to remove a Data Entry that isn’t there. This will happen if Name is set (and Value isn’t) but the Account doesn’t have a DataEntry with that Name.',
    'op_data_invalid_name' = 'Name not a valid string.',
    'op_bad_seq' = 'The specified bumpTo sequence number is not a valid sequence number. It must be between 0 and INT64_MAX (9223372036854775807 or 0x7fffffffffffffff).',
}

export enum KnownPrepareErrors {
    // TODO: Add more codes
    'Error(Contract, #205)' = 'Depositing is currently disabled for this pool. Please reach out to support.',
    'Error(Contract, #206)' = 'Swapping is currently disabled for this pool. Please reach out to support.',
    'Error(Contract, #207)' = 'Claiming is currently disabled for this pool. Please reach out to support.',
}

export default function ErrorHandler(error) {
    // wallet connect case
    if (error?.message === '') {
        return 'Transaction request timeout';
    }

    //wallet connect case and Ledger case
    if (
        error?.message === 'cancelled_by_user' ||
        error?.message === 'Transaction cancelled by the user' ||
        error?.message === LEDGER_CANCEL_ERROR
    ) {
        return 'Transaction cancelled by the user';
    }
    if (error.error) {
        return error.error;
    }
    if (!error.response) {
        return error.toString();
    }
    const { data } = error.response;
    if (!data) {
        return `clientError - ${error.message}`;
    }
    if (!data.extras || !data.extras.result_codes) {
        return `unknownResponse - ${error.message}`;
    }
    if (data.extras.result_codes.transaction === 'tx_failed') {
        return (
            OPERATIONS_ERROR_CODES[
                data.extras.result_codes.operations.find((op) => op !== 'op_success')
            ] ?? 'Oops. Something went wrong.'
        );
    }
    return (
        TRANSACTIONS_ERROR_CODES[data.extras.result_codes.transaction] ??
        'Oops. Something went wrong.'
    );
}

function findErrorCode(error: string) {
    for (let str in KnownPrepareErrors) {
        let index = error.indexOf(str);
        if (index !== -1) {
            return str;
        }
    }
    return null;
}

export function SorobanPrepareTxErrorHandler(error: string) {
    const code = findErrorCode(error);
    return KnownPrepareErrors[code] ?? 'Oops. Something went wrong.';
}

export function SorobanErrorHandler(errorName: string): string {
    const snackCaseName = errorName.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

    return TRANSACTIONS_ERROR_CODES[snackCaseName] ?? 'Oops. Something went wrong.';
}
