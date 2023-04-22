const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository')

const scrypt = util.promisify(crypto.scrypt);

class UsersRespository extends Repository{ 

    async comparePasswords(saved, supplied){
        //Saved -> password saved in db. 'hashed.salt'
        //Supplied -> password given by user on sign in
        const [hashed,salt] = saved.split('.');
        const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

        return hashed === hashedSuppliedBuf.toString('hex');

    }


    async create(attrs){
        //attrs is an object {email:'jjbbbbb.com', password:'passwd'}
        //getting existing records

        attrs.id = this.randomId();

        const salt = crypto.randomBytes(8).toString('hex');
        // scrypt returns buffer
        const buf = await scrypt(attrs.password, salt, 64);

        const records = await this.getAll();
        const record = {
            ...attrs,
            password: `${buf.toString('hex')}.${salt}`
        };
        records.push(record);

        await this.writeAll(records);
        return record;
    }

}

module.exports = new UsersRespository('users.json');


