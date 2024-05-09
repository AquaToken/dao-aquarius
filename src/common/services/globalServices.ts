import ModalServiceClass from './modal.service';
import StellarServiceClass from './stellar.service';
import WalletConnectServiceClass from './wallet-connect.service';
import ToastServiceClass from './toast.service';
import LedgerServiceClass from './ledger.service';
import FreighterServiceClass from './freighter.service';
import LobstrExtensionServiceClass from './lobstr-extension.service';
import SorobanServiceClass from './soroban.service';
import AssetsServiceClass from './assets.service';

export const ModalService = new ModalServiceClass();
export const StellarService = new StellarServiceClass();
export const WalletConnectService = new WalletConnectServiceClass();
export const ToastService = new ToastServiceClass();
export const LedgerService = new LedgerServiceClass();
export const LobstrExtensionService = new LobstrExtensionServiceClass();
export const FreighterService = new FreighterServiceClass();
export const SorobanService = new SorobanServiceClass();
export const AssetsService = new AssetsServiceClass();
