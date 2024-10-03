import axios from 'axios';

import { API_CMC } from 'constants/api';

export const getAquaCirculatingSupply = (): Promise<number> =>
    axios.get<number>(`${API_CMC}/coins/?q=circulating-v2`).then(({ data }) => data);
