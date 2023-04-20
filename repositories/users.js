const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class UsersRespository{

    constructor(filename){
        if(!filename){
            throw new Error('Creating a repository requires a filename');
        }

        this.filename = filename;
        try{
            fs.accessSync(this.filename);
        }
        catch(err){
            fs.writeFileSync(this.filename, '[]');
        }
    }
    async getAll(){
        // open the file callled this.filename
        return JSON.parse(
            await fs.promises.readFile(this.filename, {
            encoding:'utf8'
        })
        );

        // read its contents
        // console.log(contents);

        // parse the contents to an array of objects
        // const data = JSON.parse(contents);

        // return the parsed data
        // return data;
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

    async comparePasswords(saved, supplied){
        //Saved -> password saved in db. 'hashed.salt'
        //Supplied -> password given by user on sign in
        const [hashed,salt] = saved.split('.');
        const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

        return hashed === hashedSuppliedBuf.toString('hex');

    }

    async writeAll(records){
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));

    }

    randomId(){
        return crypto.randomBytes(4).toString('hex');
    }

    async getOne(id){
        const records = await this.getAll(); 
        return records.find(record => record.id === id);
    }

    async delete(id){
        const records = await this.getAll();
        const filteredRecords = records.filter(record => record.id!==id);
        await this.writeAll(filteredRecords);
    }

    async update(id, attrs){
        const records = await this.getAll();
        const record = records.find(record => record.id === id);
        
        if(!record){
            throw new Error(`Record with id ${id} not found`);
        }
        // assigning everything from attrs to record
        Object.assign(record, attrs);

        await this.writeAll(records);

    }

    async getOneBy(filters){
        const records = await this.getAll();

        for(let record of records){
            let found = true;

            for(let key in filters){
                if(record[key] !== filters[key]){
                    found = false;
                }
            }
            if(found){
                return record;
            }
        }
    }
}

module.exports = new UsersRespository('users.json');

/* instead of receiving class, we'll receive an instance. Less error prone

don't have to do this in another file:
const UsersRepository = require('./users);
const repo = new UsersRepository('user.json');
*/ 

// const test = async() => {
//     const repo = new UsersRespository('users.json');

//     //await repo.delete('900f006b');
//     //const user = await repo.getOne('900f006b');

//     //await repo.create({email:'test@test.com', password: 'password'});
//    // await repo.create({email:'test@test.com'});
    
//     // const users = await repo.getAll();

//     //await repo.update('a8559532',{password:'mypassword'});

//     const user = await repo.getOneBy({
//         email: 'test@test.com',
//         password: 'mypassword'
//     });

//     console.log(user);
// };

// test();

