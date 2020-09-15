module.exports = class Message {

    constructor(member, msg, uuid) {
        this.member = member;
        this.msg = msg;
        this.dateSend = new Date();
        this.uuid = uuid;
    }

    getMsg() {
        return this.getMsg();
    }

    getDateSend() {
        return this.dateSend;
    }

    getUid() {
        return this.uuid;
    }
}