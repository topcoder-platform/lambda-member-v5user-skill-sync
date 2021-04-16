'use strict';

const axios = require("axios");
const config = require('config')
const _ = require('lodash');

const util = require('./util')

module.exports = {
  getTags: async function () {
    try {
      const url = config.get('TC_API_URL') + '/v3/tags/?filter=domain%3DSKILLS%26status%3DAPPROVED&limit=1000'
      const response = await axios.get(url)
      return util.immediateResponse(null, 200, null, response.data.result.content)
    } catch (err) {
      return util.immediateResponse(null, 503, err, null)
    }
  },
  findTagById: function (data, id) {
    return _.find(data, { 'id': id });
  }
};