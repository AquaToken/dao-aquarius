export enum MainRoutes {
    main = '/',
    bribes = '/bribes',
    vote = '/vote',
    locker = '/locker',
    governance = '/governance',
    market = '/market',
    rewards = '/rewards',
    rewardsV2 = '/rewards-v2-demo',
    airdrop = '/airdrop',
    airdrop2 = '/airdrop2',
    account = '/account',
    walletConnect = '/wallet-connect',
    amm = '/amm',
    swap = '/swap',
}

//TODO: Replace constants with enums after TS 5.0 release
// export enum LockerRoutes {
//     main = `${MainRoutes.locker}`,
// };

export const LockerRoutes = {
    main: `${MainRoutes.locker}`,
};

export const GovernanceRoutes = {
    main: `${MainRoutes.governance}`,
    proposal: `${MainRoutes.governance}/proposal`,
    create: `${MainRoutes.governance}/create`,
    edit: `${MainRoutes.governance}/edit`,
};

export const VoteRoutes = {
    main: `${MainRoutes.vote}`,
};

export const BribesRoutes = {
    bribes: `${MainRoutes.bribes}`,
    addBribe: `${MainRoutes.bribes}/add`,
};

export const MarketRoutes = {
    main: `${MainRoutes.market}`,
};

export const AmmRoutes = {
    analytics: `${MainRoutes.amm}/analytics/`,
    liquidity: `${MainRoutes.amm}/liquidity/`,
    legacy: `${MainRoutes.amm}/legacy/`,
    create: `${MainRoutes.amm}/create-pool/`,
    balances: `${MainRoutes.amm}/balances/`,
};
