const { Member } = require('./Member');
const Message = require('./Message');

const app = require('express')();
const PORT = 3000;

class Tchat {

    constructor() {
        this.server = require('http').createServer(app);
        this.socket = require('socket.io')(this.server);
        this.members = [];
        this.messages = [];
        this.runSvr();
        this.listenNewClient();
    }

    runSvr() {
        this.server.listen(PORT);
    }

    listenNewClient() {
        this.socket.on('connection', client => this.listenMember(client));
    }

    listenMember(client) {
        client.on('memberJoin', _member => {
            let newMember = _member;
            if (this.isMemberByPseudo(newMember)) { // Si le pseudo est déja utilisé
                newMember += new Date().getTime().toString();
                this.addNewMember(newMember, client);
            }
            else if (this.isMemberBySocket(client)) { // Si le client est déja dans la liste
                console.log(client.id, "existe déja");
                this.updateAlreadyExist(client, newMember);
            } else { // sinon 
                this.addNewMember(newMember, client);
            }
        });
        client.on('receiveMsg', msg => this.listenMessage(client, msg));
        client.on('disconnect', _client => this.listenDisconnect(client))
    }


    addNewMember(newMember, client) {
        let memberInstance = new Member(newMember, client);
        this.members.push(memberInstance);
        this.sendAll('memberJoin', memberInstance, client);
        this.sendMemberList(client);
    }
    sendAll(eventName, data, client) {
        switch(eventName) {
            case 'memberDisconnect':
            case 'memberJoin':
                client.broadcast.emit(eventName, {name: data.getName(), uuid: data.getUuid()});
                break;
            case 'memberUpdate':
                client.broadcast.emit(eventName, {name: data.getName(), uuid: data.getUuid()});
                break;
            case 'newMessage':
                client.broadcast.emit(eventName, data);
                break;
            default:
                console.log('Event error')

        }
    }
    sendMemberList(client) {
        console.log(this.members.length, this.members[0].getName());
        client.emit('allMember', this.members.map(_elt => {
            return {
                name: _elt.getName(),
                uuid: _elt.getUuid()
            };
        }));
    }

    updateAlreadyExist(client, member) {
        let memberIndex = this.members.findIndex(_elt => _elt.getSocket().id === client.id);
        this.members[memberIndex].setName(member);
        console.log(this.members[memberIndex].getName());
        this.sendAll("memberUpdate", this.members[memberIndex], client);
        client.emit('myUpdate', {name: this.members[memberIndex].getName(), uuid: this.members[memberIndex].getUuid()});

    }

    listenDisconnect(client) {
        console.log('disconnect', client.id);
        console.log(this.members.map(_elt => _elt.getSocket().id))
        if (this.isMemberBySocket(client)) {
            let member = this.findMemberBySocket(client);
            console.log("Member disconnect", member.getName());
            this.sendAll('memberDisconnect', member, client);
            this.removeMember(member.getSocket());
        }
    }
    isMemberBySocket(socket) {
        return this.members.findIndex(_m => _m.getSocket().id === socket.id) !== -1;
    }

    isMemberByPseudo(name) {
        console.log(name, this.members.map(_elt => _elt.getName()));
        return this.members.findIndex(_m => _m.getName() === name) !== -1;
    }

    listenMessage(client, message) {
        console.log(message);
        if (this.messages.length > 500) {
            this.messages.shift();
        }
        this.messages.push(new Message(this.findMemberByName(message.member),message.msg, message.uuid));
        this.sendAll('newMessage',message, client);
    }

    findMemberBySocket(socket) {
        return this.members.find(_m => _m.getSocket().id === socket.id);
    }

    findMemberByName(memberName) {
        return this.members.find(_m => _m.getName() === memberName);
    }


    removeMember(socket) {
        const index = this.members.findIndex(_m => _m.getSocket().id === socket.id);
        if (index !== -1) {
            this.members.splice(index, 1);
        }
    }



}

module.exports.Tchat = Tchat;