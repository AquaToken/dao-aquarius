import Connection from 'services/soroban/connection/connection';
import AmmContract from 'services/soroban/contracts/ammContract';
import TokenContract from 'services/soroban/contracts/tokenContract';

import * as scValHelpers from './utils/scValHelpers';

export default class SorobanService {
    public connection = new Connection();
    public token = new TokenContract(this.connection);
    public amm = new AmmContract(this.connection, this.token);
    public scVal = scValHelpers;
}
