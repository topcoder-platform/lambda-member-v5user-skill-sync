'use strict';

const AWS = require('aws-sdk')
const skillInsert = require('./reuse/skill.insert')
const skillModify = require('./reuse/skill.modify')
const skillRemove = require('./reuse/skill.remove')
const tag = require('./reuse/tag')
const util = require('./reuse/util')

let fileName = "index"
let cachedTags

/**
 * Sync Dynamo DB member skills to Elastic Search
 * @param {Object} event the event object
 * @param {Object} context the context object
 * @param {Func} callback the callback
 */
module.exports.syncSkills = async (event, context, callback) => {
  let tagsResponse
  console.log('.....start......')
  if (!cachedTags) {
    tagsResponse = await tag.getTags()
    if (tagsResponse.statusCode != 200) {
      callback(null, util.immediateResponse(null, 503, "Tags service is down", null))
      return;
    }
    cachedTags = tagsResponse.data
  }
  if (cachedTags) {
    for (let count = 0; count < event.Records.length; count++) {
      let record = event.Records[count]
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY' || record.eventName === 'REMOVE') {
        util.logger(fileName, null, "Get UserId", null)
        const keys = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.Keys)
        let userId = String(keys.userId)
        if (record.eventName === 'INSERT') {
          await skillInsert.insert(count, userId, record, cachedTags)
        } else if (record.eventName === 'MODIFY') {
          await skillModify.modify(count, userId, record, cachedTags)
        } else if (record.eventName === 'REMOVE') {
          await skillRemove.remove(count, userId, record)
        }
      }
    }
    callback(null, util.fetchResponse())
    return;
  } else {
    callback(null, tagsResponse)
    return;
  }
}
