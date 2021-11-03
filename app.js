//  For this take-home assignment I used Slack's new Bolt API : https://slack.dev/bolt-js/tutorial/getting-started
// I found the documentation easy to understand and to find to the needed the functions to have the bot responed to
// certain user queues.


const { App, AwsLambdaReceiver } = require('@slack/bolt');
const axios = require('axios');
var request = require('request');
const qs = require('qs');
const botname = "Spotify Helper";


const playlist_ID = '4w2TFklE6xAPvuXY3Ko48G';

require("dotenv").config();

//The intial command I used before connecting to AWS lambda 
// const app = new App({
//     token: process.env.BOT_TOKEN,
//     signingSecret: process.env.SIGNING_SECRET
// });

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SIGNING_SECRET,
}); 



// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
  token: process.env.BOT_TOKEN,
  receiver: awsLambdaReceiver,
  // The `processBeforeResponse` option is required for all FaaS environments.
  // It allows Bolt methods (e.g. `app.message`) to handle a Slack request
  // before the Bolt framework responds to the request (e.g. `ack()`). This is
  // important because FaaS immediately terminate handlers after the response.
  processBeforeResponse: true
});



// Listens to any string that contains the string hey. hello or hi
app.message(/^(hi|hello|hey).*/i, async ({ message,command, say }) => {
  // say() sends a message to the channel where the event was triggered
  
  
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Help me!"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
    
  });
  pushData(command.user_name, command.text);
  pushData(botname, `Hey there ${command.user_name}!`);


});

// Listens for an action from a button click
app.action('button_click', async ({ body, ack, say }) => {
  
  say(`If you need help respond 'help'. If you want to see the documention repond 'doc'.`)

  
  pushData(`If you need help respond 'help'. If you want to see the documention repond 'doc'.`);

  // Acknowledge the action after say() to exit the Lambda process
  await ack();
});

// Listens to incoming messages that contain "goodbye"
app.message('goodbye', async ({ message,command, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`See ya later, <@${message.user}> :wave:`);
  pushData(command.user_name, command.text);

  pushData(botname,`See ya later, ${command.user_name} :wave:`);
  await ack();

});


// exports.handler = (event, context, callback) => {
//   if (security.validateSlackRequest(event, signingSecret)) {
//       const body = JSON.parse(event.body);
//       switch (body.type) {
//           case "url_verification": callback(null, body.challenge); break;
//           case "event_callback": processRequest(body, callback); break;
//           default: callback(null); 
//       }
//   }
//   else callback("verification failed");
// };

 
// built in module to read json
const fs = require('fs');
let raw = fs.readFileSync('db.json');
let faqs= JSON.parse(raw);


// I started with creating commands to get familiar withe the Slack appiclation 
// building 
app.command("/welcome", async ({ command, ack, say }) => {  
    try {
      await ack();
      var res = `Hello <@${command.user_name}>, I am the Spotify Helper. I can help you with listing, adding and deleting the songs from your work playlist so you and your coworkers can share and listen to your favourite music together over a slack chat. If you need help respond 'help'. If you want to see the documention repond 'doc'.`
      pushData(command.user_name, "/welcome command");
      pushData(botname, res);

      say(res); 
      await ack();   
    } catch (error) {
        console.log("err") 
      console.error(error);
    }
});

//This command will display 'FAQs' from the db.json file.
app.command("/help", async ({ command, ack, say }) => { 
  try {
    await ack();;
    say('*Here are the FAQs:*')
    let mes = { blocks: [] };
    faqs.data.map((faq) => {
      mes.blocks.push( 
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Question*",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: faq.question,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Answer ✔️*",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: faq.answer,
          },
        }
      );
    });
    await ack();
    await say(mes);
    
    pushData(command.user_name, "/help command");
    pushData(botname, mes);
  } catch (error) {
    console.log("err");
    console.error(error);
  }
});






//Waits for the user to include help in the their message and it triggers the doc json
app.message(/(doc|documentation).*/i, async ({ command, ack, say  }) => {
  try {
    let message = { blocks: [] };
    

    faqs.doc.map((doc) => {
      message.blocks.push(
      
        {
          type: "section",
          text: {
            type: "mrkdwn", 
            text: doc,
          },
        }
        
      );
    });
    
    say(message);
    await ack(); 
    pushData(command.user_name,command.text)
    pushData(botname,message)
  } catch (error) {
    console.log("err");
    console.error(error);
  }
});



//Waits for the user to include help in the their message and it triggers the FAQ json
app.message(/(help)/i, async ({ command, ack, say }) => {
  try {
    let mes = { blocks: [] };
    say('*Here are the FAQs:*')
    const FAQs = faqs.data.filter((faq) => faq.keyword === "help");

    FAQs.map((faq) => {
      mes.blocks.push(
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Question ❓*",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn", 
            text: faq.question,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Answer ✔️*",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: faq.answer,
          },
        }
      );
    });
    await ack();
    say(mes); 
    
    pushData(command.user_name,command.text)
    pushData("Spotify",mes)
  } catch (error) {
    console.log("err");
    console.error(error);
  }
});


//This function waits for the user to ask for the list in the playlist
app.message(/^(add).*/i, async ({ command, message, say ,ack }) => { 
  try {
    var track_name = await message.text.replace(/add /i,"")
    var cleaned = await track_name.replace(/\(.*?\'\)|\[.*?\]/g, "");
    console.log(cleaned)
    track = await search_Track(cleaned);

      await add_Track(track[0].uri);
      say( `Added ${track[0].name} to the Yolk playlist` );
      await ack();
    
      pushData(command.user_name,command.text)
      pushData("Spotify",`Added ${track[0].name} to the Yolk playlist`) 
      
  } catch (error) {
      console.log("err")
    console.error(error);
  }
});

//This function waits for the user to ask for the list in the playlist
app.message(/(list).*/i, async ({ command, say , ask }) => { 
  try {
    say( 'Here is the list of tracks on the Yolk Playlist:'  );
    let tracks = await listPlaylist_Track();
    console.log(tracks)
    var message = '';
     tracks.forEach(track => {
      message+= track.name + " : " + track.artists[0].name + "\n";
      
    });
    await say( message  );
    await ack();
    pushData(command.user_name, command.text);
    pushData(botname, message);
  } catch (error) {
      console.log("err")
    console.error(error);
  }
});

// Create a new WorkflowStep instance
// const ws = new WorkflowStep('delete_song', {
//   edit: async ({ ack, step, configure }) => {
//     await await ack();;

//     const blocks = [
//       {
//         type: 'input',
//         block_id: 'task_name_input',
//         element: {
//           type: 'plain_text_input',
//           action_id: 'name',
//           placeholder: {
//             type: 'plain_text',
//             text: 'Delete a song',
//           },
//         },
//         label: {
//           type: 'plain_text',
//           text: 'Song name',
//         },
//       }
      
//     ];

//     await configure({ blocks });
//   },
//   save: async ({ ack, step, update }) => {},
//   execute: async ({ step, complete, fail }) => {},
// });

// app.step(ws);

app.error((error) => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error(error);
});


app.message(/(delete|remove).*/i, async ({ message, command, say , ack }) => { 
  try {    
    var track_name = message.text.replace(/(delete |remove )/i,"");
    //cleaning the string to prevent any unwanted attacks and offen have many different symbols and spotify search engine find your song without them
     var cleaned = await track_name.replace(/\(.*?\'\)|\[.*?\]/g, "");
     
    track = await search_Track(cleaned);
    var uri = track[0].uri;

    if(uri != '' || uri != null){
      delete_Track(uri);
      say(`Track \'${track[0].name}\' has been deleted`);
    }else{
      say(`Error deleting the \'${track[0].name}\', it does not exist in the playlist.`);
    }
   
    pushData(command.user_name, command.text);
    pushData(botname, `Track \'${track[0].name}\' has been deleted`);
    await ack();
    
  } catch (error) {
      console.log("err")
    console.error(error);
  }
});


//  Manually connecting to Spotify to list the Yolk playlist 

const client_id = process.env.SPOTIFY_ID; // Your client id
const client_secret = process.env.SPOTIFY_SECRET; // Your secret
const auth_token = Buffer.from(`${client_id}:${client_secret}`, 'utf-8').toString('base64');

//gertAuth only works for the listPlaylist_Track() function because remove and add need further client access than ''grant_type':'client_credentials'
// can provide
const getAuth = async () => {
  try{
    //make post request to SPOTIFY API for access token, sending relavent info
    const token_url = 'https://accounts.spotify.com/api/token';
    const data = qs.stringify({'grant_type':'client_credentials'});

    const response = await axios.post(token_url, data, {
      headers: { 
        'Authorization': `Basic ${auth_token}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      }
    })
    //return access token
    return response.data.access_token;
    //console.log(response.data.access_token);   
  }catch(error){
    //on fail, log the error in console
    console.log(error);
  }
}



// ********************** ASYNC Functions **************************
// listPlaylist_Track() accepts no permeters and list the Yolk playlist 
// delete_Track(uri) takes one argument and deletes the song from the list
// add_Track(uri) takes one argument and adds the song to the list
// search_Track(track) uses the Spotify search engine to get the song's uri code
// for adding and deleting a track


async function listPlaylist_Track(){
  //request token using getAuth() function
  const access_token = await getAuth();
  //console.log(access_token);

  const api_url = `https://api.spotify.com/v1/playlists/${playlist_ID}/tracks`;
  //console.log(api_url);
  try{
    const response = await axios.get(api_url, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });


    let tracks = [];

  for (let track_obj of response.data.items) { 
    const track = track_obj.track
    tracks.push(track);
  }
  

  return tracks;
  }catch(error){
    console.log(error);
  }  
};



function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
      console.log(body);
  }
}

async function delete_Track(uri){
  //request token using getAuth() function
  const access_token =  process.env.AUTH_ID;
  // console.log(access_token);

  //console.log(api_url);

   
  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + access_token
  };
  
  var dataString = '{"tracks":[{"uri": "'+ uri +'"}]}';
  
  var options = {
    url: 'https://api.spotify.com/v1/playlists/4w2TFklE6xAPvuXY3Ko48G/tracks',
    method: 'DELETE',
    headers: headers,
    body: dataString
  };
  
  
  request(options, callback);

}

// search item from the Spotify search to get the Songs Id and uri to post the the playlist

async function search_Track(track) {
    //request token using getAuth() function
  const access_token = await getAuth();
  //console.log(access_token);
  track =track.replace(" ", "%20" );
  const api_url = `https://api.spotify.com/v1/search?q=${track}&type=track&market=CA&limit=1`;
  //console.log(api_url);
  try{
    const response = await axios.get(api_url, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    // console.log(response.data)

    return response.data.tracks.items;

  }catch(error){
    console.log(error);
  }  
}

// adding the track
async function add_Track(uri) {
const access_token = process.env.AUTH_ID;
const api_url = `https://api.spotify.com/v1/playlists/${playlist_ID}/tracks?uris=${uri}`;
//console.log(api_url);
try{
  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.AUTH_ID
};

var options = {
    url: api_url,
    method: 'POST', api_url,
    headers: headers
};

request(options, callback);

}catch(error){
  console.log(error);
}  
}


// // posting to a local port to host the slack bot code
// (async () => {
//   // Start your app
//   await app.start(process.env.PORT || 3000);

//   console.log('⚡️ Bolt app is running!');
// })();

// ****************Google sheets package ******************* ///
// Get spreadsheet npm package
const { GoogleSpreadsheet } = require('google-spreadsheet');
// credentials from google
const clientSecret = require('./client_secret.json');
const { command } = require('commander');

// Google sheet 
const googleSheetID = '1cepadIlM3NSfEWcEhBvh76Kk2W53RfboyPamPvN3hSQ';

// Instantiates the spreadsheet
const doc = new GoogleSpreadsheet(googleSheetID);


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

// Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}

