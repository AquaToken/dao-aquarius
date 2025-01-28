import { Asset } from '@stellar/stellar-sdk';

import EventService from './event.service';

export enum AssetsEvent {
    newAssets = 'newAssets',
}
export default class AssetsServiceClass {
    event: EventService<AssetsEvent, { payload: Asset[] }> = new EventService();

    processAssets(assets: Asset[]) {
        this.event.trigger({ type: AssetsEvent.newAssets, payload: assets });
    }
}
