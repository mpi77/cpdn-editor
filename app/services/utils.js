'use strict';

class Utils {
    constructor() {
    }

    mysqlTimeStampToDate (timestamp) {
        let regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
        let parts=timestamp.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
        return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
    }
    
    getMysqlTimeStamp(date) {
       let now = (date != null && date != undefined) ? date : new Date();
       return (now.getFullYear() + '-' + ((now.getMonth() + 1) < 10 ? ("0" + (now.getMonth() + 1)) : (now.getMonth() + 1) )+ '-' + ((now.getDate() < 10) ? ("0" + now.getDate()) : (now.getDate())) + " " + ((now.getHours() < 10) ? ("0" + now.getHours()) : (now.getHours())) + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                     .getSeconds()) : (now.getSeconds())));
    }
    
    randomString(len, charSet) {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < len; i++) {
        	let randomPoz = Math.floor(Math.random() * charSet.length);
        	randomString += charSet.substring(randomPoz,randomPoz+1);
        }
        return randomString;
    }


}

export default angular.module('cpdnEditor.utils', [])
  .service('Utils', Utils)
  .name;
