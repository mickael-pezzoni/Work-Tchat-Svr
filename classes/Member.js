const { v4 } = require('uuid');

class Member {

    constructor(name, socket) {
        this.name = name;
        this.socket = socket;
        this.uuid = v4();
    }

    getSocket() {
        return this.socket;
    }

    getName() {
        return this.name;
    }

    getUuid() {
        return this.uuid;
    }
}

module.exports.Member = Member;