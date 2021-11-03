// Get spreadsheet npm package
const { GoogleSpreadsheet } = require('google-spreadsheet');
// credentials from google
const clientSecret = require('./client_secret.json');

// Google sheet 
const googleSheetID = '1cepadIlM3NSfEWcEhBvh76Kk2W53RfboyPamPvN3hSQ';

// Instantiates the spreadsheet
const doc = new GoogleSpreadsheet(googleSheetID);

// const sheet = await doc.addSheet({ headerValues: ['name', 'email'] });

//


async function pushData(user, usertext){
    try {
        // Authenticate using the JSON file we set up earlier
        await doc.useServiceAccountAuth(clientSecret);
        await doc.loadInfo();

        const sheet = doc.sheetsByIndex[0]
        console.log(sheet);

        console.log('user:' +user);

        console.log('text:'+usertext);

        // create a sheet and set the header row
        // const sheet = await doc.addSheet({ headerValues: ['speaker', 'res'] });
        
        await sheet.addRow({ Speaker: user, Text: usertext});
       

    }catch(err) {
        console.log(err);
        return false;
    }
}



module.exports.pushData = pushData;
