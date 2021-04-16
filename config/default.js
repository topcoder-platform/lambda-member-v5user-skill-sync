module.exports = {
  ES_URL: process.env.ES_URL || "",
  ES_AWS_REGION: process.env.ES_AWS_REGION || "",
  ES_API_VERSION: process.env.ES_API_VERSION || "",
  ES_SKILLS_INDEX: process.env.ES_SKILLS_INDEX || "",
  ES_SKILLS_MAPPING: process.env.ES_SKILLS_MAPPING || "",
  DB_ENTERED_SKILLS_STREAM: process.env.DB_ENTERED_SKILLS_STREAM || "",
  DB_AGGREGATED_SKILLS_STREAM: process.env.DB_AGGREGATED_SKILLS_STREAM || "",
  LAMBDA_ROLE: process.env.LAMBDA_ROLE || "",
  TC_API_URL: process.env.TC_API_URL || ""
}