import { ENV_PRODUCTION, ENV_TESTNET } from './env';

export const CONTRACTS = {
    [ENV_PRODUCTION]: {
        amm: 'CBQDHNBFBZYE4MKPWBSJOPIYLW4SFSXAXUTSXJN76GNKYVYPCKWC6QUK',
        batch: 'CBZX5A64HWVYXGGXSSWGYZZTUYFNGVKLAESK3XOZDJXYKLOY7MTCFAEV',
    },
    [ENV_TESTNET]: {
        amm: 'CDGX6Q3ZZIDSX2N3SHBORWUIEG2ZZEBAAMYARAXTT7M5L6IXKNJMT3GB',
        batch: 'CBLKS7PCOSCWQW5DUDLPWCQUUU7EFZXA7Z2ZQLJ2UYPE7VTELSQPTSEV',
    },
};
