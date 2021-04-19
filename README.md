# member-skills-sync-lambda

## Prerequisites

- Nodejs(v12+)

## Configuration

Configuration for the skill record processor is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- UBAHN_API_URL: The ubahn api url, default value: 'https://api.topcoder-dev.com/v5'
- TC_API_URL: The topcoder api url, default value: 'https://api.topcoder-dev.com'
- AUTH0_URL: The auth0 url, default value: 'https://topcoder-dev.auth0.com/oauth/token'
- AUTH0_UBAHN_AUDIENCE: The auth0 audience for accessing ubahn api(s), default value: 'https://u-bahn.topcoder-dev.com'
- AUTH0_TOPCODER_AUDIENCE: The auth0 audience for accessing tc api(s), default value: 'https://m2m.topcoder-dev.com/'
- AUTH0_CLIENT_ID: The auth0 client id
- AUTH0_CLIENT_SECRET: The auth0 client secret
- AUTH0_PROXY_SERVER_URL: Proxy Auth0 URL, used to get TC M2M token
- SKILL_PROVIDER_NAME: The skill provider name, default value: Topcoder
- SLEEP_TIME: The pause time between two create operations, default value: 1000 ms

## Local Test

- install the dependencies

``` bash
npm install
```

- run linters if required

``` bash
npm run lint
npm run lint:fix # To fix possible lint errors
```

- run test

``` bash
npm test
```

## Deploy

- make sure you have installed the dependencies
- make sure you have aws credentials in you environment
- update the `.env` file, set `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` and other configurations that you want to change

``` bash
npm run deploy
```

## Verification

After deploy, you can open [aws lambda config](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/member-v5user-skill-sync?tab=testing) to test, here is the example event json `{
  "Records":[
    {
      "eventID":"904156e21aa4f1085f970bfdbcbfb483",
      "eventName":"MODIFY",
      "eventVersion":"1.1",
      "eventSource":"aws:dynamodb",
      "awsRegion":"us-east-1",
      "dynamodb":{
        "ApproximateCreationDateTime":1618587935,
        "Keys":{
          "userId":{
            "N":"40153932"
          }
        },
        "NewImage":{
          "skills":{
            "S":"{\"110\":{\"tagName\":null,\"hidden\":false,\"score\":1.0,\"sources\":[]},\"117\":{\"tagName\":null,\"hidden\":false,\"score\":1.0,\"sources\":[]}}"
          },
          "userHandle":{
            "S":"sachin-kumar"
          },
          "updatedBy":{
            "S":"40153932"
          },
          "userId":{
            "N":"40153932"
          },
          "handleLower":{
            "S":"sachin-kumar"
          },
          "updatedAt":{
            "N":"1618587934734"
          }
        },
        "OldImage":{
          "skills":{
            "S":"{\"110\":{\"tagName\":null,\"hidden\":false,\"score\":1.0,\"sources\":[]}}"
          },
          "userHandle":{
            "S":"sachin-kumar"
          },
          "updatedBy":{
            "S":"40153932"
          },
          "userId":{
            "N":"40153932"
          },
          "handleLower":{
            "S":"sachin-kumar"
          },
          "updatedAt":{
            "N":"1618586677911"
          }
        },
        "SequenceNumber":"9298848500000000010313715543",
        "SizeBytes":394,
        "StreamViewType":"NEW_AND_OLD_IMAGES"
      },
      "eventSourceARN":":table/MemberEnteredSkills/stream/2018-09-21T08:58:50.405"
    }
  ]
}` 
