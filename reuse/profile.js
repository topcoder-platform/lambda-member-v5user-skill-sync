'use strict';

const dynamo = require('./dynamo')
const util = require('./util')

module.exports = {
  getByUserId: async function (count, userId) {
    var output
    var memberProfile = await dynamo.getByExpressionAttributes("MemberProfile", "#userId = :userId", { "#userId": "userId" }, { ":userId": Number(userId) })
    switch (memberProfile.Count) {
      case 0:
        output = util.storeResponse(count, userId, 404, null, null, false)
        break;
      case 1:
        output = util.storeResponse(count, userId, 200, null, memberProfile.Items[0], false)
        break;
      default:
        output = util.storeResponse(count, userId, 406, null, null, false)
        break;
    }
    return output;
  }
};