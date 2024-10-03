import AssetsServiceClass from './assets.service';
import FreighterServiceClass from './freighter.service';
import LedgerServiceClass from './ledger.service';
import LobstrExtensionServiceClass from './lobstr-extension.service';
import ModalServiceClass from './modal.service';
import SorobanServiceClass from './soroban.service';
import StellarServiceClass from './stellar.service';
import ToastServiceClass from './toast.service';
import WalletConnectServiceClass from './wallet-connect.service';

export const ModalService = new ModalServiceClass();
export const StellarService = new StellarServiceClass();
export const WalletConnectService = new WalletConnectServiceClass();
export const ToastService = new ToastServiceClass();
export const LedgerService = new LedgerServiceClass();
export const LobstrExtensionService = new LobstrExtensionServiceClass();
export const FreighterService = new FreighterServiceClass();
export const SorobanService = new SorobanServiceClass();
export const AssetsService = new AssetsServiceClass();
