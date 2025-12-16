import { getIsTestnetEnv } from 'helpers/env';

const EXPLORER_LINK = 'https://stellar.expert/explorer/';

export enum ExplorerSection {
    account = 'account',
    tx = 'tx',
    contract = 'contract',
    asset = 'asset',
}

function getExplorerLink(section: ExplorerSection.tx, hash: string, opId?: string): string;
function getExplorerLink(section: ExplorerSection.account, publicKey: string): string;
function getExplorerLink(section: ExplorerSection.contract, contract: string): string;
function getExplorerLink(
    section: ExplorerSection.account | ExplorerSection.contract,
    target: string,
): string;
function getExplorerLink(section: ExplorerSection.asset, assetString: string): string;
function getExplorerLink(section: ExplorerSection, target: string, opId?: string): string {
    return `${EXPLORER_LINK}${getIsTestnetEnv() ? 'testnet' : 'public'}/${section}/${target}${
        opId ? `#${opId}` : ''
    }`;
}

export default getExplorerLink;
