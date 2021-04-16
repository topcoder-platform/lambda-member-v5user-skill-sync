'use strict';

const AWS = require('aws-sdk')
var dynamo = new AWS.DynamoDB.DocumentClient()

module.exports = {
  getByExpressionAttributes: async function (tableName, keyConditionExpression, expressionAttributeNames,
    expressionAttributeValues) {
    const params = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }
    return dynamo.query(params).promise();
  },
  getByIndexName: async function (tableName, indexName, keyConditionExpression, expressionAttributeValues) {
    const params = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues
    }
    return dynamo.query(params).promise();
  },
  scanBySegment: async function (tableName, limitProfile, lastEvaluatedKey, segment, totalSegments) {
    const params = {
      TableName: tableName,
      Limit: limitProfile,
      ExclusiveStartKey: lastEvaluatedKey,
      Segment: segment,
      TotalSegments: totalSegments
    }
    return dynamo.scan(params).promise();
  },
  insertByItems: async function (tableName, items) {
    var params = {
      TableName: tableName,
      Item: items
    };
    return dynamo.put(params).promise();
  }
};