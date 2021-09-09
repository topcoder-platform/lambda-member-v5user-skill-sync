/**
 * This file defines helper methods
 */

const _ = require('lodash')
const config = require('config')
const { default: axios } = require('axios')

const m2mAuth = require('tc-core-library-js').auth.m2m

const m2mForTopcoder = m2mAuth({
  AUTH0_AUDIENCE: config.AUTH0_TOPCODER_AUDIENCE,
  ..._.pick(config, ['AUTH0_URL', 'AUTH0_PROXY_SERVER_URL'])
})

const m2mForUbahn = m2mAuth({
  AUTH0_AUDIENCE: config.AUTH0_UBAHN_AUDIENCE,
  ..._.pick(config, ['AUTH0_URL', 'AUTH0_PROXY_SERVER_URL'])
})

/**
 * Sleep
 */
async function sleep () {
  await new Promise(resolve => setTimeout(resolve, config.SLEEP_TIME))
}

/*
 * Function to get M2M token for topcoder api(s)
 * @returns {Promise}
 */
const getM2MToken = async () => {
  return m2mForTopcoder.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
}

/*
  * Function to get M2M token for U-Bahn api(s)
  * @returns {Promise}
  */
const getM2MUbahnToken = async () => {
  return m2mForUbahn.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
}

/**
 * Get the V5 Skill/Taxonomy record
 * @param {String} path the resource path
 * @param {String} params the query params
 * @returns {Object} the u-bahn user
 */
async function getV5SkillResource (path, params) {
  const token = await getM2MUbahnToken()
  const res = await axios.get(`${config.UBAHN_API_URL}/${path}`, {
    params,
    headers: { Authorization: `Bearer ${token}` }
  })
  const result = _.head(_.get(res, 'data'))
  if (!result) {
    throw Error(`Cannot find u-bahn resource ${path} with params ${JSON.stringify(params)}`)
  }
  return result
}

/**
 * Get the ubahn record
 * @param {String} path the resource path
 * @param {String} params the query params
 * @returns {Object} the u-bahn user
 */
async function getUbahnResource (path, params) {
  const token = await getM2MUbahnToken()
  const res = await axios.get(`${config.UBAHN_API_URL}/${path}`, {
    params,
    headers: { Authorization: `Bearer ${token}` }
  })
  const result = _.head(_.get(res, 'data'))
  if (!result) {
    throw Error(`Cannot find u-bahn resource ${path} with params ${JSON.stringify(params)}`)
  }
  return result
}

/**
 * Create user skill
 * @param {String} userId the user id
 * @param {Number} score the skill score
 * @param {String} skillId the skill id
 */
async function createUserSkill (userId, score, skillId) {
  const token = await getM2MUbahnToken()
  await axios.post(`${config.UBAHN_API_URL}/users/${userId}/skills`, { metricValue: _.toString(score), skillId }, { headers: { Authorization: `Bearer ${token}` } })
  console.log(`created skill ${skillId} of user ${userId} with metricValue ${score}`)
}

/**
 * Update user skill
 * @param {String} userId the user id
 * @param {Number} score the skill score
 * @param {String} skillId the skill id
 */
async function updateUserSkill (userId, score, skillId) {
  const token = await getM2MUbahnToken()
  await axios.patch(`${config.UBAHN_API_URL}/users/${userId}/skills/${skillId}`, { metricValue: _.toString(score) }, { headers: { Authorization: `Bearer ${token}` } })
  console.log(`updated skill ${skillId} of user ${userId} with metricValue ${score}`)
}

/**
 * Delete user skill
 * @param {String} userId the user id
 * @param {String} skillId the skill id
 */
async function deleteUserSkill (userId, skillId) {
  const token = await getM2MUbahnToken()
  await axios.delete(`${config.UBAHN_API_URL}/users/${userId}/skills/${skillId}`, { headers: { Authorization: `Bearer ${token}` } })
  console.log(`deleted skill ${skillId} of user ${userId}`)
}

/**
 * Get user
 * @param {String} handle the user handle
 * @returns {Object} the user
 */
async function getUser (handle) {
  return getUbahnResource('users', { handle })
}

/**
 * Check user skill exist
 * @param {String} userId the user id
 * @param {String} skillId the skill id
 * @returns {Boolean}
 */
async function checkUserSkillExist (userId, skillId) {
  const token = await getM2MUbahnToken()
  const skillRes = await axios.get(`${config.UBAHN_API_URL}/users/${userId}/skills/${skillId}`, { headers: { Authorization: `Bearer ${token}` }, validateStatus: null })
  return _.has(skillRes, 'data.id')
}

/**
 * Get tag name
 * @param {String} tagId the tag id
 * @returns {String} tag name
 */
async function getTagName (tagId) {
  const token = await getM2MToken()
  const tagRes = await axios.get(`${config.TC_API_URL}/v3/tags/${tagId}`, { headers: { Authorization: `Bearer ${token}` }, params: { filter: 'domain=SKILLS', status: 'APPROVED' } })
  return _.get(tagRes, 'data.result.content.name')
}

module.exports = {
  sleep,
  getM2MToken,
  getM2MUbahnToken,
  getV5SkillResource,
  deleteUserSkill,
  updateUserSkill,
  createUserSkill,
  getUser,
  checkUserSkillExist,
  getTagName
}
