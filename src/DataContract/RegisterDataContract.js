//THIS IS THE DGM - REGISTER DATA CONTRACT

const Dash = require('dash');

const clientOpts = {
  network: 'testnet',
  wallet: {
    mnemonic:
      'Your Mnemonic',

    unsafeOptions: {
      skipSynchronizationBeforeHeight: 885000,
      //change to what the actual block height
    },
  },
};

const client = new Dash.Client(clientOpts);

const registerContract = async () => {
  const { platform } = client;
  const identity = await platform.identities.get(
    'Your Identity ID',
  ); // Your identity ID
  //THIS NEED TO MATCH THE ABOVE MNEMONIC ^^ 

  /*{ //DGM Address Query
    where: [
      ['ownerId', '==', ['IdentityID-PUT-HERE']],
      
    ],
  }*/

//https://github.com/dashpay/platform/pull/435 chore(dpp)!: allow only asc order for indices #435

  const contractDocuments = {
    dgmaddress1: {
        type: 'object',
        indices: [
          {
            name: 'ownerId',
            properties: [{ $ownerId: 'asc' }],
            unique: false,
          }
        ],
        properties: {
          address: {
            type: 'string',
            minLength: 34,
            maxLength: 34,
          }
        }
        ,required: ['address',"$createdAt", "$updatedAt"]
        ,additionalProperties: false,
      },
    };

  

  const contract = await platform.contracts.create(contractDocuments, identity);
  console.dir({ contract: contract.toJSON() });

  const validationResult = await platform.dpp.dataContract.validate(contract);

  if (validationResult.isValid()) {
    console.log('Validation passed, broadcasting contract..');
    // Sign and submit the data contract
    return platform.contracts.publish(contract, identity);
  }
  console.error(validationResult); // An array of detailed validation errors
  throw validationResult.errors[0];
};

registerContract()
  .then((d) => console.log('Contract registered:\n', d.toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());
