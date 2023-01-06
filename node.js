const hubspot = require('@hubspot/api-client');

exports.main = async (event, callback) => {

  //Created by Nathan De Long @HubSpot, 1/6/2023
  //Shoutout to Jake Connors for helping me with the date variables! 
  //This custom code action counts the number of closed won deals a contact has been associated with over the past 365 days. Modify var pastDate for different lengths of time -- replace 365 with 90, 120, etc.
  //This code is provided as-is; please test in a sandbox before using in a production environment! 
  
  /*****
    How to use secrets
    Secrets are a way for you to save API keys or private apps and set them as a variable to use anywhere in your code
    Each secret needs to be defined like the example below
  *****/

  const hubspotClient = new hubspot.Client({
    accessToken: process.env.hstoken
  });
  
try {
  
  //hs_object_id is the record ID for the contact in this workflow. 
  const hs_object_id = event.inputFields['hs_object_id'];
  var pastDate = new Date(new Date().setDate(new Date().getDate() - 365));
  console.log ("The past date is ", pastDate);
  var currentDate = new Date();
  console.log ("the current date is ", currentDate);
  const apiResponse2 = await hubspotClient
    .apiRequest({
      method: 'POST',
      path: `/crm/v3/objects/deals/search`,
      body: {
      "filterGroups": [
            {
            "filters": 
              [
                {
                    "propertyName": "associations.contact",
                    "operator": "EQ",
                    "value": hs_object_id
                },
                {
                    "propertyName": "hs_is_closed_won",
                    "operator": "EQ",
                    "value": "true"
                },
                {
                    "propertyName": "closedate",
                    "operator":"BETWEEN",
                    "highValue": `${currentDate.getTime()}`,
                    "value": `${pastDate.getTime()}`
                    //"values": [pastDate, Date.now()]
                }
              ]
            }
                    ]
             }
               });
  console.log (apiResponse2.body.results);
  //Send the ids of the closed won deals in the past 365 days to an array
  const dealResponse = apiResponse2.body.results.map( id => id.id);
  console.log("Here are the closed deal ids ", dealResponse);
  //Count the number of items in the array
  var numDeals = dealResponse.length
  //Print the number of deals to the console
  console.log("Here is the number of closed won deals in the past 365 days: ", numDeals)
  
  } catch (err) {
    console.error(err);
    // We will automatically retry when the code fails because of a rate limiting error from the HubSpot API.
    throw err;
  }

  callback({
    outputFields: {
      numDeals
    }
  });
}
