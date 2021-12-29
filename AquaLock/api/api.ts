import axios from 'axios';

const apiUrl = 'https://airdrop-2-stats.aqua.network/';

export const getSharePrice = () => {
    return axios.get<{ share_price: string }>(apiUrl).then((res) => {
        return res.data.share_price;
    });
};
