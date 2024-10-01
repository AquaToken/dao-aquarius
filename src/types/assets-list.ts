type Asset = {
    code: string;
    issuer: string;
    anchor_asset: null | string;
    anchors: string[];
    custom_transfer_domain: null | string;
    custom_transfer_support: null | string;
    is_counter_selling: boolean;
    deposit: boolean;
    withdraw: boolean;
    history: boolean;
    sep24: boolean;
    disabled: boolean;
    unlisted: boolean;
    coinmarketcap_id: number;
};

type IssuerOrgs = {
    display_name: string;
    domain: string;
    website: string;
    support: null | string;
    color: string;
    logo: string;
    disabled: boolean;
    assets: Asset[];
};

export type AssetsList = {
    issuer_orgs: IssuerOrgs[];
    build_id: string;
};
