// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';
var EventHubClient = require('azure-event-hubs').Client;
var Promise = require('bluebird');

// The Event Hubs SDK can also be used with an Azure IoT Hub connection string.
// In that case, the eventHubPath variable is not used and can be left undefined.
var connectionString = 'Endpoint=sb://autonubeventhub.servicebus.windows.net/;SharedAccessKeyName=infromsubscriberhub;SharedAccessKey=533HJhCxZIynOV1xbQKBWgilDQ4euKRSUxWsbZBG1v4=;EntityPath=infrompnsubscriber' 

var sendEvent = function (eventBody) {
  return function (sender) {
    console.log('Sending Event: ' + eventBody);
    return sender.send(eventBody);
  };
};

var printError = function (err) {
  console.error(err.message);
};

var printEvent = function (ehEvent) {
  console.log('Event Received: ');
  console.log(JSON.stringify(ehEvent.body));
  console.log('');
};

var client = EventHubClient.fromConnectionString(connectionString );
var receiveAfterTime = Date.now() - 5000;

client.open()
      .then(client.getPartitionIds.bind(client))
      .then(function (partitionIds) {
        return Promise.map(partitionIds, function (partitionId) {
          return client.createReceiver('$Default', partitionId, { 'startAfterTime' : receiveAfterTime}).then(function(receiver) {
            receiver.on('errorReceived', printError);
            receiver.on('message', printEvent);
          });
        });
      })
      .then(function() {
        return client.createSender();
      })
      .then(sendEvent('foo'))
      .catch(printError);
