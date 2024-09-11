export type AssetDetails = {
    asset: string;
    created: number;
    supply: number;
    trustlines: [number, number, number];
    payments: number;
    payments_amount: number;
    traded_amount: number;
    volume7d: number;
    price7d: Array<[number, number]>;
    toml_info: {
        code: string;
        issuer: string;
        name: string;
        image: string;
        decimals: number;
        orgName: string;
        orgLogo: string;
    };
    domain: string;
    rating: {
        age: number;
        trades: number;
        payments: number;
        trustlines: number;
        volume7d: number;
        interop: number;
        liquidity: number;
        average: number;
    };
};
