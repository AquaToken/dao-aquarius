import * as connection from './connection/connection';
import * as ammContract from './contracts/ammContract';
import * as token from './contracts/tokenContract';
import * as scValHelpers from './utils/scValHelpers';

export default class SorobanService {
    public connection = connection;
    public amm = ammContract;
    public scVal = scValHelpers;
    public token = token;

    constructor() {
        this.connection.startServer();

        this.token.restoreFromCache();
    }
}
