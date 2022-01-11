import axios from 'axios';

const apiUrl = 'https://airdrop-2-stats.aqua.network/';

export const getSharePrice = () => {
    return axios.get<{ share_price: string; aqua_price: string }>(apiUrl).then((res) => {
        return res.data;
    });
};

export const getEmulatedSharePrice = (price: string) => {
    return axios
        .get<{ share_price: string }>(`${apiUrl}emulation/?aqua_price=${price}`)
        .then((res) => {
            return res.data.share_price;
        });
};
