'use strict';

const config = require('config')
const Joi = require('joi')
const elasticsearch = require('elasticsearch')
const AWS = require('aws-sdk')

const util = require('./util')

const createUpdateSchema = {
  userId: Joi.number().integer().required(),
  handleLower: Joi.string().required(),
  userHandle: Joi.string().required(),
  updatedBy: Joi.number().integer().required(),
  updatedAt: Joi.date().timestamp().required(),
  skills: Joi.object().pattern(/^[a-zA-Z0-9]{1,}$/,
    Joi.object({
      score: Joi.number().integer().required(),
      sources: Joi.array().min(1).unique().required(),
      hidden: Joi.boolean().required(),
      tagName: Joi.string().required()
    }).unknown()
  )
}

const esUrl = config.get('ES_URL')
const esApiVersion = config.get('ES_API_VERSION')
const esAwsRegion = config.get('ES_AWS_REGION')
let esClient
AWS.config.region = esAwsRegion

module.exports = {
  getESClient: async function () {
    if (!esClient) {
      if (/.*amazonaws.*/.test(esUrl)) {
        esClient = new elasticsearch.Client({
          apiVersion: esApiVersion,
          hosts: esUrl,
          connectionClass: require('http-aws-es'), // eslint-disable-line global-require
          amazonES: {
            region: esAwsRegion,
            credentials: new AWS.EnvironmentCredentials('AWS')
          }
        })
      } else {
        esClient = new elasticsearch.Client({
          apiVersion: esApiVersion,
          hosts: esUrl
        })
      }
    }
    return esClient
  },
  exists: async function (id) {
    const client = await this.getESClient()
    return await client.exists({
      index: config.get('ES_SKILLS_INDEX'),
      type: config.get('ES_SKILLS_MAPPING'),
      id: id
    })
  },
  get: async function (count, id) {
    const client = await this.getESClient()
    const output = await client.get({
      index: config.get('ES_SKILLS_INDEX'),
      type: config.get('ES_SKILLS_MAPPING'),
      id: id
    })
    return util.storeResponse(count, id, 200, null, output._source, false)
  },
  create: async function (count, id, data) {
    const { error } = Joi.validate(data, createUpdateSchema, { abortEarly: false });
    if (error)
      return util.storeResponse(count, id, 422, null, error, true)

    const client = await this.getESClient()
    const output = await client.create({
      index: config.get('ES_SKILLS_INDEX'),
      type: config.get('ES_SKILLS_MAPPING'),
      id,
      body: data
    })
    return util.storeResponse(count, id, 200, null, output, false)
  },
  update: async function (count, id, data) {
    const { error } = Joi.validate(data, createUpdateSchema, { abortEarly: false });
    if (error)
      return util.storeResponse(count, id, 422, null, error, true)

    const client = await this.getESClient()
    const output = await client.update({
      index: config.get('ES_SKILLS_INDEX'),
      type: config.get('ES_SKILLS_MAPPING'),
      id,
      body: { upsert: data, doc: data }
    })
    return util.storeResponse(count, id, 200, null, output, false)
  },
  remove: async function (count, id) {
    const client = await this.getESClient()
    const output = await client.delete({
      index: config.get('ES_SKILLS_INDEX'),
      type: config.get('ES_SKILLS_MAPPING'),
      id
    })
    return util.storeResponse(count, id, 200, null, output, false)
  }
};