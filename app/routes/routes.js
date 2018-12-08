/****************************************************/
/* Router Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/* Description : Router class                       */
/****************************************************/

class RouterClass{

    constructor(){
        this.express = require("express");
        this.app     = this.express();
        this.router = this.express.Router();
        
    }

}

module.exports = RouterClass;