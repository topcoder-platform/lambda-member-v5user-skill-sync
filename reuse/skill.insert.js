'use strict';

const AWS = require('aws-sdk')

const profile = require('./profile')
const skillHelper = require('./skill.helper')
const util = require('./util')
const elasticsearch = require('./elasticsearch')

let fileName = "skill.insert"

module.exports = {
  insert: async function (count, userId, record, cachedTags) {
    util.logger(fileName, null, "Get Member Profile from DynamoDB", null)
    let memberProfileResponse = await profile.getByUserId(count, userId)
    if (memberProfileResponse.statusCode == 200) {
      let memberSkillsNewImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage)
      memberSkillsNewImage.skills = util.parseJSON(memberSkillsNewImage.skills)
      util.logger(fileName, "Member Skills New Image", memberSkillsNewImage, 2)
      let memberSkillNewFixSourceResponse = await skillHelper.fixSourceSkill(count, userId, memberSkillsNewImage, record.eventSourceARN)
      if (memberSkillNewFixSourceResponse.statusCode == 200) {
        if (await elasticsearch.exists(userId)) {
          util.logger(fileName, null, "Update ES Document", null)
          let elasticsearchGetResponse = await elasticsearch.get(count, userId)
          if (elasticsearchGetResponse.statusCode == 200) {
            util.logger(fileName, "From ES", elasticsearchGetResponse.data, null)
            var memberSkillsDeepMergeResponse = await skillHelper.deepMergeSkill(count, userId, memberSkillNewFixSourceResponse.data, elasticsearchGetResponse.data)
            util.logger(fileName, "Deep Merge", memberSkillsDeepMergeResponse.data, null)
            let memberSkillsAddMissingDataResponse = await skillHelper.addMissingDataSkill(count, cachedTags, memberSkillsDeepMergeResponse.data, memberProfileResponse.data)
            if (memberSkillsAddMissingDataResponse.statusCode == 200) {
              util.logger(fileName, "Pushing to ES", memberSkillsAddMissingDataResponse.data, 2)
              let elasticsearchUpdateResponse = await elasticsearch.update(count, userId, memberSkillsAddMissingDataResponse.data)
              util.logger(fileName, "Elasticsearch Update Response", elasticsearchUpdateResponse.data, null)
            }
          }
        } else {
          util.logger(fileName, null, "Create ES Document", null)
          let memberSkillsAddMissingDataResponse = await skillHelper.addMissingDataSkill(count, cachedTags, memberSkillNewFixSourceResponse.data, memberProfileResponse.data)
          if (memberSkillsAddMissingDataResponse.statusCode == 200) {
            util.logger(fileName, "Pushing to ES", memberSkillsAddMissingDataResponse.data, 2)
            let elasticsearchCreateResponse = await elasticsearch.create(count, userId, memberSkillsAddMissingDataResponse.data)
            util.logger(fileName, "Elasticsearch Create Response", elasticsearchCreateResponse.data, null)
          }
        }
      }
    }
  }
};