/**
 * Lambda function to sync user skills
 */

const _ = require('lodash')
const config = require('config')
const helper = require('./src/common/helper')

/**
 * Function to sync user skill
 * @param {String} userId the userId
 * @param {String} tagId the tag id
 * @param {Number} score the skill score
 * @param {String} taxonomyId the taxonomy id
 * @param {boolean} isDelete if delete the skill
 * @returns {Promise}
 */
async function syncUserSkill(userId, tagId, score, taxonomyId, isDelete) {
  const name = await helper.getTagName(tagId)
  const skill = await helper.getUbahnResource('skills', { taxonomyId, name })
  const skillExist = await helper.checkUserSkillExist(userId, skill.id)
  if (isDelete && skillExist) {
    helper.deleteUserSkill(userId, skill.id)
  } else if (skillExist) {
    await helper.updateUserSkill(userId, score, skill.id)
  } else {
    await helper.createUserSkill(userId, score, skill.id)
  }
}

/**
 * Sync member skills
 * @param {Object} event the event object
 */
module.exports.handle = async (event) => {
  try {
    console.log(`Received event: `, JSON.stringify(event))
    const taxonomy = await helper.getUbahnResource('taxonomies', { name: config.TAXONOMY_NAME })
    for (const record of event.Records) {
      try {
        const handle = _.get(record, 'dynamodb.NewImage.userHandle.S')
        const newSkills = JSON.parse(_.get(record, 'dynamodb.NewImage.skills.S', '{}'))
        const oldSkills = JSON.parse(_.get(record, 'dynamodb.OldImage.skills.S', '{}'))
        const createSkills = _.omit(newSkills, _.keys(oldSkills))
        const deleteSkills = _.omit(oldSkills, _.keys(newSkills))
        const updateSkills = _.filter(_.pick(newSkills, _.keys(oldSkills)), (v, k) => oldSkills[k].score !== v.score)
        if (_.isEmpty(createSkills) && _.isEmpty(deleteSkills) && _.isEmpty(updateSkills)) {
          console.log(`there are no skills to create, update or delete for user ${handle}`)
          continue
        }
        console.log('Skills to create:', JSON.stringify(createSkills))
        console.log('Skills to update:', JSON.stringify(updateSkills))
        console.log('Skills to delete:', JSON.stringify(deleteSkills))
        const user = await helper.getUser(handle)
        for (const key of _.keys(createSkills)) {
          await syncUserSkill(user.id, key, _.get(createSkills,`${key}.score`, 0), taxonomy.id)
          await helper.sleep()
        }
        for (const key of _.keys(updateSkills)) {
          await syncUserSkill(user.id, key, _.get(createSkills,`${key}.score`, 0), taxonomy.id)
          await helper.sleep()
        }
        for (const key of _.keys(deleteSkills)) {
          await syncUserSkill(user.id, key, 0, taxonomy.id, true)
          await helper.sleep()
        }
      } catch (e) {
        console.log(`sync user's skills failed. Error: ${e.message}`)
      }
    }
  } catch (e) {
    console.log(`some error occured: ${e.message}`)
  }
}
