const updateEvent = {
  'Records': [
    {
      'eventID': '904156e21aa4f1085f970bfdbcbfb483',
      'eventName': 'MODIFY',
      'eventVersion': '1.1',
      'eventSource': 'aws:dynamodb',
      'awsRegion': 'us-east-1',
      'dynamodb': {
        'ApproximateCreationDateTime': 1618587935,
        'Keys': {
          'userId': {
            'N': '40153932'
          }
        },
        'NewImage': {
          'skills': {
            'S': '{"110":{"tagName":null,"hidden":false,"score":1.0,"sources":[]},"117":{"tagName":null,"hidden":false,"score":1.0,"sources":[]}}'
          },
          'userHandle': {
            'S': 'sachin-kumar'
          },
          'updatedBy': {
            'S': '40153932'
          },
          'userId': {
            'N': '40153932'
          },
          'handleLower': {
            'S': 'sachin-kumar'
          },
          'updatedAt': {
            'N': '1618587934734'
          }
        },
        'OldImage': {
          'skills': {
            'S': '{"110":{"tagName":null,"hidden":false,"score":1.0,"sources":[]}}'
          },
          'userHandle': {
            'S': 'sachin-kumar'
          },
          'updatedBy': {
            'S': '40153932'
          },
          'userId': {
            'N': '40153932'
          },
          'handleLower': {
            'S': 'sachin-kumar'
          },
          'updatedAt': {
            'N': '1618586677911'
          }
        },
        'SequenceNumber': '9298848500000000010313715543',
        'SizeBytes': 394,
        'StreamViewType': 'NEW_AND_OLD_IMAGES'
      },
      'eventSourceARN': ':table/MemberEnteredSkills/stream/2018-09-21T08:58:50.405'
    }
  ]
}

const deleteEvent = {
  'Records': [
    {
      'eventID': '005ffa73f8cbec0f8836b00aa9fc51c1',
      'eventName': 'MODIFY',
      'eventVersion': '1.1',
      'eventSource': 'aws:dynamodb',
      'awsRegion': 'us-east-1',
      'dynamodb': {
        'ApproximateCreationDateTime': 1618647829,
        'Keys': {
          'userId': {
            'N': '40153932'
          }
        },
        'NewImage': {
          'skills': {
            'S': '{"110":{"tagName":null,"hidden":false,"score":1.0,"sources":[]}}'
          },
          'userHandle': {
            'S': 'sachin-kumar'
          },
          'updatedBy': {
            'S': '40153932'
          },
          'userId': {
            'N': '40153932'
          },
          'handleLower': {
            'S': 'sachin-kumar'
          },
          'updatedAt': {
            'N': '1618647828746'
          }
        },
        'OldImage': {
          'skills': {
            'S': '{"110":{"tagName":null,"hidden":false,"score":1.0,"sources":[]},"117":{"tagName":null,"hidden":false,"score":1.0,"sources":[]}}'
          },
          'userHandle': {
            'S': 'sachin-kumar'
          },
          'updatedBy': {
            'S': '40153932'
          },
          'userId': {
            'N': '40153932'
          },
          'handleLower': {
            'S': 'sachin-kumar'
          },
          'updatedAt': {
            'N': '1618587934734'
          }
        },
        'SequenceNumber': '9302277400000000039255062919',
        'SizeBytes': 394,
        'StreamViewType': 'NEW_AND_OLD_IMAGES'
      },
      'eventSourceARN': 'xxxxtable/MemberEnteredSkills/stream/2018-09-21T08:58:50.405'
    }
  ]
}
module.exports = {
  updateEvent,
  deleteEvent
}
