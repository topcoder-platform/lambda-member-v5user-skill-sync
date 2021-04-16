'use strict';

const AWS = require('aws-sdk')
const config = require('config')
const _ = require('lodash');

const skillHelper = require('./skill.helper')
const util = require('./util')
const elasticsearch = require('./elasticsearch')

let fileName = "skill.remove"

module.exports = {
  remove: async function (count, userId, record) {
    var stream
    if (record.eventSourceARN == config.get('DB_AGGREGATED_SKILLS_STREAM')) {
      util.logger(fileName, null, "DB_AGGREGATED_SKILLS_STREAM :: ", null)
      stream = "CHALLENGE"
    } else if (record.eventSourceARN == config.get('DB_ENTERED_SKILLS_STREAM')) {
      util.logger(fileName, null, "DB_ENTERED_SKILLS_STREAM :: ", null)
      stream = "USER_ENTERED"
    }
    let memberSkillsOldImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage)
    memberSkillsOldImage.skills = util.parseJSON(memberSkillsOldImage.skills)
    util.logger(fileName, "Member Skills Old Image", memberSkillsOldImage, 2)
    let memberSkillOldFixSourceResponse = await skillHelper.fixSourceSkill(count, userId, memberSkillsOldImage, record.eventSourceARN)
    if (memberSkillOldFixSourceResponse.statusCode == 200) {
      util.logger(fileName, "Member Skill Old - Fix Source Response", memberSkillOldFixSourceResponse.data, 2)
      let elasticsearchGetResponse = await elasticsearch.get(count, userId)
      if (elasticsearchGetResponse.statusCode == 200) {
        util.logger(fileName, "Elasticsearch Get Response", elasticsearchGetResponse.data, 2)
        for (let attributename in memberSkillOldFixSourceResponse.data.skills) {
          util.logger(fileName, null, "Skill Id :: " + attributename, null)
          if (elasticsearchGetResponse.data.skills.hasOwnProperty(attributename)) {
            util.logger(fileName, null, "Has Skill Id :: " + attributename, null)
            if (elasticsearchGetResponse.data.skills[attributename].sources.length === 1 && elasticsearchGetResponse.data.skills[attributename].sources.indexOf(stream) !== -1) {
              util.logger(fileName, null, "1 Skills found :: " + elasticsearchGetResponse.data.skills[attributename].sources, null)
              delete elasticsearchGetResponse.data.skills[attributename]
              continue
            } else if (elasticsearchGetResponse.data.skills[attributename].sources.indexOf(stream) !== -1) {
              util.logger(fileName, null, "1+ Skills found :: " + elasticsearchGetResponse.data.skills[attributename].sources, null)
              elasticsearchGetResponse.data.skills[attributename].sources.splice(elasticsearchGetResponse.data.skills[attributename].sources.indexOf(stream), 1)
            }
          }
        }
        util.logger(fileName, "Skills data ", _.size(elasticsearchGetResponse.data.skills), null)
        if (_.size(elasticsearchGetResponse.data.skills) === 0) {
          util.logger(fileName, "Removing from ES", elasticsearchGetResponse.data, 2)
          let elasticsearchRemoveResponse = await elasticsearch.remove(count, userId)
          util.logger(fileName, "Elasticsearch Delete Response", elasticsearchRemoveResponse.data, null)
        } else {
          util.logger(fileName, "Pushing to ES", elasticsearchGetResponse.data, 2)
          let elasticsearchRemoveResponse = await elasticsearch.remove(count, userId)
          util.logger(fileName, "Elasticsearch Delete Response", elasticsearchRemoveResponse.data, null)
          let elasticsearchCreateResponse = await elasticsearch.create(count, userId, elasticsearchGetResponse.data)
          util.logger(fileName, "Elasticsearch Create Response", elasticsearchCreateResponse.data, null)
        }
      }
    }

  }
};