import EventService from './event.service';
import { Asset } from '@stellar/stellar-sdk';

export enum AssetsEvent {
    newAssets = 'newAssets',
}
export default class AssetsServiceClass {
    event = new EventService();

    processAssets(assets: Asset[]) {
        this.event.trigger({ type: AssetsEvent.newAssets, payload: assets });
    }
}
