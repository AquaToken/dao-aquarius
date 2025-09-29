import { AuthEvent, AuthPayload } from 'services/auth/events/events';
import LedgerService from 'services/auth/ledger/ledger.service';
import LobstrExtensionService from 'services/auth/lobstr-extension/lobstr-extension.service';
import WalletConnectService from 'services/auth/wallet-connect/wallet-connect.service';
import WalletKitService from 'services/auth/wallet-kit/wallet-kit.service';
import EventService from 'services/event.service';

export default class AuthServiceClass {
    event: EventService<AuthEvent, AuthPayload> = new EventService();
    ledger: LedgerService;
    walletConnect: WalletConnectService;
    lobstrExtension: LobstrExtensionService;
    walletKit: WalletKitService;

    constructor() {
        this.ledger = new LedgerService(this.event);
        this.walletConnect = new WalletConnectService(this.event);
        this.lobstrExtension = new LobstrExtensionService(this.event);
        this.walletKit = new WalletKitService(this.event);
    }
}
