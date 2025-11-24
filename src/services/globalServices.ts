import AuthServiceClass from 'services/auth/auth.service';

import AssetsServiceClass from './assets.service';
import ModalServiceClass from './modal.service';
import SorobanServiceClass from './soroban/soroban.service';
import StellarServiceClass from './stellar/stellar.service';
import ToastServiceClass from './toast.service';

export const ModalService = new ModalServiceClass();
export const StellarService = new StellarServiceClass();
export const ToastService = new ToastServiceClass();
export const SorobanService = new SorobanServiceClass();
export const AssetsService = new AssetsServiceClass();

export const AuthService = new AuthServiceClass();
