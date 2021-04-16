'use strict';

const config = require('config')
const moment = require('moment');
const _ = require('lodash');
const deepmerge = require('deepmerge');
const observableDiff = require('deep-diff').observableDiff;
const applyChange = require('deep-diff').applyChange;

const tag = require('./tag')
const util = require('./util')

let fileName = "skill.helper"

module.exports = {
  addMissingDataSkill: async function (count, cachedTags, memberSkills, memberProfile) {
    try {
      if (!memberSkills.hasOwnProperty("userId")) {
        memberSkills.userId = memberProfile.userId
        util.logger(fileName, null, "userId :: " + memberSkills.userId, null)
      }
      if (!memberSkills.hasOwnProperty("handleLower")) {
        memberSkills.handleLower = memberProfile.handleLower
        util.logger(fileName, null, "handleLower :: " + memberSkills.handleLower, null)
      }
      if (!memberSkills.hasOwnProperty("userHandle")) {
        memberSkills.userHandle = memberProfile.handle
        util.logger(fileName, null, "userHandle :: " + memberSkills.userHandle, null)
      }
      if (!memberSkills.hasOwnProperty("updatedBy")) {
        memberSkills.updatedBy = memberProfile.userId.toString()
        util.logger(fileName, null, "updatedBy :: " + memberSkills.updatedBy, null)
      }
      if (!memberSkills.hasOwnProperty("updatedAt")) {
        memberSkills.updatedAt = moment().valueOf()
        util.logger(fileName, null, "updatedAt :: " + memberSkills.updatedAt, null)
      }
      let skills = util.parseJSON(memberSkills.skills)
      for (let attributename in skills) {
        if (!skills[attributename].hasOwnProperty("score")) {
          skills[attributename].score = 0;
          util.logger(fileName, null, "skills[attributename].score :: " + skills[attributename].score, null)
        }
        if (!skills[attributename].hasOwnProperty("hidden")) {
          skills[attributename].hidden = false;
          util.logger(fileName, null, "skills[attributename].hidden :: " + skills[attributename].hidden, null)
        }
        if (!skills[attributename].hasOwnProperty("tagName")) {
          let tagDetails = tag.findTagById(cachedTags, Number(attributename))
          if (tagDetails) {
            skills[attributename].tagName = tagDetails.name
            util.logger(fileName, null, "skills[attributename].tagName :: " + skills[attributename].tagName, null)
          } else {
            util.logger(fileName, null, "skills[attributename].tagName (Missing tag remove) :: " + skills[attributename], null)
            delete skills[attributename];
            continue
          }
        }
      }
      memberSkills.skills = skills
      return util.storeResponse(count, memberProfile.userId, 200, null, memberSkills, false)
    } catch (err) {
      util.logger(fileName, "err ::", err, 2)
      return util.storeResponse(count, memberProfile.userId, 503, err, null, false)
    }
  },
  fixSourceSkill: async function (count, id, memberSkills, sourceARN) {
    try {
      let skills = util.parseJSON(memberSkills.skills)
      for (let attributename in skills) {
        if (sourceARN == config.get('DB_AGGREGATED_SKILLS_STREAM')) {
          util.logger(fileName, null, "DB_AGGREGATED_SKILLS_STREAM :: ", null)
          if (skills[attributename].hasOwnProperty("sources")) {
            if (((skills[attributename].sources).indexOf("CHALLENGE") === -1)) {
              util.logger(fileName, "Removed (No Challenge) :: ", skills[attributename], 2)
              delete skills[attributename]
              continue
            }
          } else {
            util.logger(fileName, "Removed (No Source) :: ", skills[attributename], 2)
            delete skills[attributename]
            continue
          }
        } else if (sourceARN == config.get('DB_ENTERED_SKILLS_STREAM')) {
          util.logger(fileName, null, "DB_ENTERED_SKILLS_STREAM :: ", null)
          if (skills[attributename].hasOwnProperty("sources")) {
            if (((skills[attributename].sources).indexOf("USER_ENTERED") === -1)) {
              util.logger(fileName, "Removed (No Challenge) :: ", skills[attributename], 2)
              delete skills[attributename]
              continue
            }
          } else {
            util.logger(fileName, "Add user ented (No Source) :: ", skills[attributename], 2)
            skills[attributename].sources = []
            skills[attributename].sources.push("USER_ENTERED");
          }
        }
      }
      return util.storeResponse(count, id, 200, null, memberSkills, false)
    } catch (err) {
      util.logger(fileName, "err ::", err, 2)
      return util.storeResponse(count, id, 503, err, null, false)
    }
  },
  deepMergeSkill: async function (count, id, dbSkills, esSkills) {
    var skillMerged = deepmerge(esSkills, dbSkills, {
      arrayMerge: (destination, source) => {
        if (destination.toString().trim() == "" || source.toString().trim() == "") {
          util.logger(fileName, null, "Add both destination :: " + destination.toString() + ", source :: " + source.toString(), null)
          return [...destination, ...source]
        } else if (destination.toString().indexOf(source.toString()) > -1) {
          util.logger(fileName, null, "Add only destination :: " + destination.toString() + ", source :: " + source.toString(), null)
          return [...destination, ""]
        } else if (source.toString().indexOf(destination.toString()) > -1) {
          util.logger(fileName, null, "Add only source :: " + source.toString() + ", destination :: " + destination.toString(), null)
          return ["", ...source]
        } else {
          util.logger(fileName, null, "Add both destination :: " + destination.toString() + ", source :: " + source.toString(), null)
          return [...destination, ...source]
        }
      }
    })
    return util.storeResponse(count, id, 200, null, skillMerged, false)
  },
  deepApplyChangeSkill: async function (count, id, newSkills, oldSkills, esSkills) {
    observableDiff(oldSkills, newSkills, function (change) {
      if(change.kind === "D") {
        if(change.path.length === 2) {
          if (change.hasOwnProperty("lhs")) {
            for (var item in change.lhs) {
              if (item === "sources") {
                var changeCopy = _.cloneDeep(change)
                changeCopy.path.push(item)
                for (var source in changeCopy.lhs[item]) {
                  var index = esSkills.skills[changeCopy.path[1]].sources.indexOf( changeCopy.lhs[item][source] )
                  changeCopy.path.push([index])
                  util.logger(fileName, "Observable Diff :: Delete :: Source :: change - " + source + " / " + changeCopy.lhs[item][source], changeCopy, 2)
                  applyChange(esSkills, null, changeCopy)
                }
                
              } else {
                var changeCopy = _.cloneDeep(change)
                changeCopy.path.push(item)
                util.logger(fileName, "Observable Diff :: Delete :: Not Source :: change - " + item, changeCopy, 2)
                applyChange(esSkills, null, changeCopy)
              }
            }
          }
        }
      } else {
        util.logger(fileName, "Observable Diff :: Add, Edited, & Change", change, 2)
        applyChange(esSkills, null, change)
      }
    });
    return util.storeResponse(count, id, 200, null, esSkills, false)
  }
};
