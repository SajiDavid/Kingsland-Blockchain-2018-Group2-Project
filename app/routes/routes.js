/****************************************************/
/* Router Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/* Description : Router class                       */
/****************************************************/

class RouterClass {

    constructor() {
        this.express = require("express");
        this.app = this.express();
        this.http = require('http').Server(this.app);
        this.router = this.express.Router();
        this.io = require('socket.io').listen(this.http);
        this.client = require('socket.io-client'); // Socket.io Client
    }

}

module.exports = RouterClass;