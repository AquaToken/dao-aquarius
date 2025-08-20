import WalletKitServiceClass from 'services/wallet-kit.service';

import AssetsServiceClass from './assets.service';
import LedgerServiceClass from './ledger.service';
import LobstrExtensionServiceClass from './lobstr-extension.service';
import ModalServiceClass from './modal.service';
import SorobanServiceClass from './soroban/soroban.service';
import StellarServiceClass from './stellar.service';
import ToastServiceClass from './toast.service';
import WalletConnectServiceClass from './wallet-connect.service';

export const ModalService = new ModalServiceClass();
export const StellarService = new StellarServiceClass();
export const WalletConnectService = new WalletConnectServiceClass();
export const ToastService = new ToastServiceClass();
export const LedgerService = new LedgerServiceClass();
export const LobstrExtensionService = new LobstrExtensionServiceClass();
export const SorobanService = new SorobanServiceClass();
export const AssetsService = new AssetsServiceClass();
export const WalletKitService = new WalletKitServiceClass();
