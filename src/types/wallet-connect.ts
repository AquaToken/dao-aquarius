export enum WalletConnectEvents {
    login = 'login',
    logout = 'logout',
}

export type Listings = { [id: string]: Wallet };
export type Wallet = {
    app: {
        browser: string;
        ios: string;
        android: string;
        mac: string;
        windows: string;
        linux: string;
    };
    chains: string[];
    description: string;
    desktop: { native: string; universal: string };
    homepage: string;
    id: string;
    metadata: { shortName: string; colors: { primary: string; secondary: string } };
    mobile: { native: string; universal: string };
    name: string;
    versions: string[];
    image_url: {
        lg: string;
        md: string;
        sm: string;
    };
};
