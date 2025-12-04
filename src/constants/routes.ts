import { createNestedRoutes } from 'helpers/createNestedRoutes';

enum SectionBases {
    bribes = '/bribes/',
    locker = '/locker/',
    governance = '/governance/',
    market = '/market/',
    amm = '/pools/',
    swap = '/swap/',
    delegate = '/delegate/',
    incentives = '/incentives/',
}

export const AppRoutes = {
    page: {
        main: '/',
        rewards: '/rewards/',
        airdrop: '/airdrop/',
        airdrop2: '/airdrop2/',
        account: '/dashboard/',
        walletConnect: '/wallet-connect/',
        buyAqua: '/buy-aqua/',
        testnet: '/testnet/',
        terms: '/terms/',
        privacy: '/privacy/',
        token: '/token/',
        quest: '/quest/',
        vote: '/vote/',
    },
    section: {
        locker: createNestedRoutes(SectionBases.locker, {
            index: '',
            about: 'about',
        }),
        governance: createNestedRoutes(SectionBases.governance, {
            index: '',
            proposal: 'proposal/:id/:version?',
            create: 'create',
            edit: 'edit/:id',
        }),
        incentive: createNestedRoutes(SectionBases.incentives, {
            index: '',
            addIncentive: 'add',
        }),
        bribes: createNestedRoutes(SectionBases.bribes, {
            index: '',
            addBribe: 'add',
        }),
        market: createNestedRoutes(SectionBases.market, {
            market: ':base/:counter',
        }),
        amm: createNestedRoutes(SectionBases.amm, {
            index: '',
            create: 'create-pool',
            pool: ':poolAddress',
        }),
        delegate: createNestedRoutes(SectionBases.delegate, {
            index: '',
            become: 'apply',
        }),
        swap: createNestedRoutes(SectionBases.swap, {
            index: ':source/:destination/',
        }),
    },
};
