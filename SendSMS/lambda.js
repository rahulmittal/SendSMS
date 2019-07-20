
let AWS = require('aws-sdk');
const cognito_idp = new AWS.CognitoIdentityServiceProvider();
const sns = new AWS.SNS();

exports.handler = function (event, context, callback) {
    let receiver = event['receiver'];
    let sender = event['sender'];
    let message = event['message'];
    let isPromotional = true;
    console.log("Sending message{", message, "}to receiver{", receiver + "}");

    /**
     * Get the list of users and check if the mobile no exists in the list.
     */
    cognito_idp.listUsers({
        UserPoolId: "us-east-1_ZYvkePp7C",
        AttributesToGet: [
            "sub",
            "name",
            "email",
            "phone_number"
        ],
        Limit: 10
    }, function (error, data) {
        if (error) {
            console.log("cognito_idp.listUsers - failed", error);
            throw error;
        }
        console.log("list of users.");console.log(data);
    });

    sns.publish({
        Message: message,
        MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
                'DataType': 'String',
                'StringValue': 'Transactional'
            },
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': sender
            }/*,
            'AWS.SNS.SMS.MaxPrice': {
                'DataType': 'Number',
                'NumberValue': 0.50
            }  */
        },
        PhoneNumber: receiver
    }).promise()
        .then(data => {
            console.log("Sent message to", receiver + " response data :"); console.log(data);
            callback(null, data);
        })
        .catch(err => {
            console.log("Sending failed", err);
            callback(err);
        });

    callback(null, 'Successfully executed');
    //callback(null, {"message": "Successfully executed"});
}