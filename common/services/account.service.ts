import AccountRecord, { AccountResponse, Horizon } from 'stellar-sdk';

const AQUA_CODE = 'AQUA';
const AQUA_ISSUER = 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA';

export default class AccountService extends AccountResponse {
    constructor(account: typeof AccountRecord) {
        super(account);
    }

    getAquaBalance(): number | null {
        const aquaBalance = this.balances.find(
            (balance) =>
                (balance as Horizon.BalanceLineAsset).asset_code == AQUA_CODE &&
                (balance as Horizon.BalanceLineAsset).asset_issuer === AQUA_ISSUER,
        );

        if (!aquaBalance) {
            return null;
        }

        return +aquaBalance.balance;
    }
}
