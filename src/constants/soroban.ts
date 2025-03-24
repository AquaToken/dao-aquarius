import { ENV_PRODUCTION, ENV_TESTNET } from './env';

export const CONTRACTS = {
    [ENV_PRODUCTION]: {
        amm: 'CBQDHNBFBZYE4MKPWBSJOPIYLW4SFSXAXUTSXJN76GNKYVYPCKWC6QUK',
        batch: 'CBZX5A64HWVYXGGXSSWGYZZTUYFNGVKLAESK3XOZDJXYKLOY7MTCFAEV',
    },
    [ENV_TESTNET]: {
        amm: 'CD23TLIL6DUYAXDVIO6XLEMVVR2KF7XJP6EPTAMF6NBODCXSYK7UIOBB',
        batch: 'CD6HW5URZKY5UHFAF3FB5EPZYWQQP3MUP65QOJNI6XUTXHWKTTMOP2AA',
    },
};
