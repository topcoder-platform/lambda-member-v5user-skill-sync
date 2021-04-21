const { handle } = require('../index')
const {
  updateEvent,
  deleteEvent
} = require('./testData')

async function main () {
  console.log('testing create event...')
  await handle(updateEvent)

  console.log('testing delete event...')
  await handle(deleteEvent)
}

main().then(() => {
  console.info('done!')
  process.exit()
}).catch(err => {
  console.error(err.message)
  process.exit(1)
})
