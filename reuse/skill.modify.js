'use strict';

const AWS = require('aws-sdk')

const profile = require('./profile')
const skillHelper = require('./skill.helper')
const util = require('./util')
const elasticsearch = require('./elasticsearch')

let fileName = "skill.modify"

module.exports = {
  modify: async function (count, userId, record, cachedTags) {
    util.logger(fileName, null, "Get Member Profile from DynamoDB", null)
    let memberProfileResponse = await profile.getByUserId(count, userId)
    if (memberProfileResponse.statusCode == 200) {
      let memberSkillsNewImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage)
      memberSkillsNewImage.skills = util.parseJSON(memberSkillsNewImage.skills)
      let memberSkillNewFixSourceResponse = await skillHelper.fixSourceSkill(count, userId, memberSkillsNewImage, record.eventSourceARN)
      if (memberSkillNewFixSourceResponse.statusCode == 200) {
        util.logger(fileName, "Member Skill New - Fix Source Response", memberSkillNewFixSourceResponse.data, 2)
        let memberSkillsOldImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage)
        memberSkillsOldImage.skills = util.parseJSON(memberSkillsOldImage.skills)
        let memberSkillOldFixSourceResponse = await skillHelper.fixSourceSkill(count, userId, memberSkillsOldImage, record.eventSourceARN)
        if (memberSkillOldFixSourceResponse.statusCode == 200) {
          util.logger(fileName, "Member Skill Old - Fix Source Response", memberSkillOldFixSourceResponse.data, 2)
          if (await elasticsearch.exists(userId)) {
            util.logger(fileName, null, "Skill found in Elasticsearch", null)
            let elasticsearchGetResponse = await elasticsearch.get(count, userId)
            if (elasticsearchGetResponse.statusCode == 200) {
              util.logger(fileName, "Elasticsearch Get Response", elasticsearchGetResponse.data, 2)
              let memberSkillsDeepApplyChangeResponse = await skillHelper.deepApplyChangeSkill(count, userId, memberSkillNewFixSourceResponse.data, memberSkillOldFixSourceResponse.data, elasticsearchGetResponse.data)
              if (memberSkillsDeepApplyChangeResponse.statusCode == 200) {
                util.logger(fileName, "Member Skills Deep Apply Change Response", memberSkillsDeepApplyChangeResponse.data, 2)
                let memberSkillsAddMissingDataResponse = await skillHelper.addMissingDataSkill(count, cachedTags, memberSkillsDeepApplyChangeResponse.data, memberProfileResponse.data)
                if (memberSkillsAddMissingDataResponse.statusCode == 200) {
                  util.logger(fileName, "Modify - Pushing to ES", memberSkillsAddMissingDataResponse.data, 2)
                  let elasticsearchCreateResponse = await elasticsearch.update(count, userId, memberSkillsAddMissingDataResponse.data)
                  util.logger(fileName, "Elasticsearch Create Response", elasticsearchCreateResponse.data, null)
                }
              }
            }
          } else {
            util.logger(fileName, null, "Skill Not found in Elasticsearch", null)
            var memberSkillsDeepMergeResponse = await skillHelper.deepMergeSkill(count, userId, memberSkillNewFixSourceResponse.data, memberSkillOldFixSourceResponse.data)
            util.logger(fileName, "Deep Merge", memberSkillsDeepMergeResponse.data, null)
            if (memberSkillsDeepMergeResponse.statusCode == 200) {
              util.logger(fileName, "Member Skills Deep Apply Change Response", memberSkillsDeepMergeResponse.data, 2)
              let memberSkillsAddMissingDataResponse = await skillHelper.addMissingDataSkill(count, cachedTags, memberSkillsDeepMergeResponse.data, memberProfileResponse.data)
              if (memberSkillsAddMissingDataResponse.statusCode == 200) {
                util.logger(fileName, "Pushing to ES", memberSkillsAddMissingDataResponse.data, 2)
                let elasticsearchCreateResponse = await elasticsearch.create(count, userId, memberSkillsAddMissingDataResponse.data)
                util.logger(fileName, "Elasticsearch Create Response", elasticsearchCreateResponse.data, null)
              }
            }
          }
        }
      }
    }
  }
};