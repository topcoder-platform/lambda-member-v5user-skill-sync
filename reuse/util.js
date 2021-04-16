'use strict';

const cleanDeep = require('clean-deep');

const cleanDeepOptions = { emptyArrays: true, emptyObjects: true, emptyStrings: true, nullValues: true, undefinedValues: true }
const statusCodeMessage = {
  200: "Ok, Success",
  400: "Bad Request",
  422: "Unprocessable Entity",
  404: "Member Not Found in DynamoDB",
  406: "Not Acceptable, Multiple Members Found",
  503: "Service Unavailable",
  501: "Not Implemented"
}
const allowLogger = ["index", "skill.insert", "skill.modify", "skill.remove", "skill.helper"]
var outputResponse = []

module.exports = {
  immediateResponse: function (userId, statusCode, statusMessage, data) {
    if (statusMessage) {
      return cleanDeep({ statusCode: statusCode, data: data, body: JSON.stringify(cleanDeep({ "userId": userId, "statusMessage": statusMessage }, cleanDeepOptions)) }, cleanDeepOptions)
    } else {
      return cleanDeep({ statusCode: statusCode, data: data, body: JSON.stringify(cleanDeep({ "userId": userId, "statusMessage": statusCodeMessage[statusCode] }, cleanDeepOptions)) }, cleanDeepOptions)
    }
  },
  storeResponse: function (count, userId, statusCode, statusMessage, data, allowData) {
    if (outputResponse.length >= (count + 1)) {
      if (statusMessage) {
        outputResponse.splice(count, 1, cleanDeep({ statusCode: statusCode, userId: userId, statusMessage: statusMessage, data: allowData ? data : null }, cleanDeepOptions))
      } else {
        outputResponse.splice(count, 1, cleanDeep({ statusCode: statusCode, userId: userId, statusMessage: statusCodeMessage[statusCode], data: allowData ? data : null }, cleanDeepOptions))
      }
    } else {
      if (statusMessage) {
        outputResponse.push(cleanDeep({ statusCode: statusCode, userId: userId, statusMessage: statusMessage, data: allowData ? data : null }, cleanDeepOptions))
      } else {
        outputResponse.push(cleanDeep({ statusCode: statusCode, userId: userId, statusMessage: statusCodeMessage[statusCode], data: allowData ? data : null }, cleanDeepOptions))
      }
    }
    return this.immediateResponse(userId, statusCode, statusMessage, data)
  },
  fetchResponse: function () {
    var response = outputResponse
    outputResponse = []
    return { statusCode: 200, body: JSON.stringify(response) }
  },
  parseJSON: function (obj) {
    if (typeof obj === "string") {
      try {
        return JSON.parse(obj);
      } catch (e) {
        return e;
      }
    }
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      return e;
    }
  },
  logger: function (fileName, title, data, spaceChar) {
    if (allowLogger.includes(fileName)) {
      if (title === undefined || title == null || title.length <= 0) {
        console.log(JSON.stringify(data, null, spaceChar))
      } else {
        console.log(title + "---------------------------------")
        console.log(JSON.stringify(data, null, spaceChar))
        console.log("---------------------------------")
      }
    }
  }
};