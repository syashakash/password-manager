var argv = require('yargs')
    .command('hello', 'Greet the user', function(__yargs) {
        __yargs.option({
            name: {
                demand: true,
                alias: 'n',
                description: 'Your first name goes here',
                type: 'string'
            },
            lastname: {
                demand: true,
                alias: 'l',
                description: 'Your last anme goes here',
                type: 'string'
            }
        }).help('help');
    })
    .command('create', 'Create a new account', function(__yargs) {
        __yargs.option({
            name: {
                demand: true,
                alias: 'n',
                description: 'Account name goes here',
                type: 'string'
            },
            username: {
                demand: true,
                alias: 'u',
                type: 'string',
                description: 'Your account username goes here'
            },
            password: {
                demand: true,
                alias: 'p',
                type: 'string',
                description: 'Your password goes here'
            },
            masterpassword: {
                demand: true,
                type: 'string',
                alias: 'm',
                description: 'Master Password'
            }
        }).help('help');
    })
    .command('get', 'Check if account existing or not', function(__yargs) {
        __yargs.option({
            name: {
                demand: true,
                description: 'Name that is to be checked',
                alias: 'n',
                type: 'string'
            },
            masterpassword: {
                demand: true,
                type: 'string',
                alias: 'm',
                description: 'Master Paassword'
            }
        }).help('help');
    })
    .help('help')
    .argv;
var command = argv._[0];
var storage = require('node-persist');
var __crypto = require('crypto-js');

console.log("Starting Password Manager");

storage.initSync();

function getAccounts(masterPassword)
{
  var encryptedAccount = storage.getItemSync('accounts');
  var accounts = [];
  if(typeof encryptedAccount !== 'undefined') {
    var bytes = __crypto.AES.decrypt(encryptedAccount, masterPassword);
    accounts = JSON.parse(bytes.toString(__crypto.enc.Utf8));
  }
  //console.log(accounts);
  return accounts;
}

function saveAccounts (accounts, masterPassword)
{
  var accString = __crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);
  storage.setItemSync('accounts', accString.toString());
  return accounts;
}

function createAccount (account, masterPassword)
{
    var accounts = getAccounts(masterPassword);
    accounts.push(account);
    saveAccounts(accounts, masterPassword);
}

function getAccount(accountName, masterPassword)
{
    var accounts = getAccounts(masterPassword);
    //console.log(accounts);
    var matchedAcc;
    accounts.forEach(function(account) {
        if (account.name === accountName)
            matchedAcc = account;
    });
    return matchedAcc;
}

//IF THE COMMAND IS HELLO
if (command === 'hello' && typeof argv.name != 'undefined' && typeof argv.lastname != 'undefined')
    console.log('Hello ' + argv.name + ' ' + argv.lastname + '!');
else if (command === 'hello' && typeof argv.name != 'undefined')
    console.log('Hello ' + argv.name + '!');
else if (command === 'hello')
    console.log('Hello World!');
//IF THE COMMAND IS CREATE
else if (command === 'create')
    try {
        createAccount({
        name: argv.name,
        username: argv.username,
        password: argv.password
        }, argv.masterpassword);
    } catch(e) {
      console.log('Unable to create account!');
    }
//IF THE COMMAND IS GET
else if (command === 'get') {
  try {
    var FetchedAccount = getAccount(argv.name, argv.masterpassword);
    if (typeof FetchedAccount == 'undefined')
        console.log('Account not found');
    else {
        console.log('Account Found!!');
        console.log(FetchedAccount);
    }
  } catch(e) {
    console.log('Unable to fetch account!');
  }
}
