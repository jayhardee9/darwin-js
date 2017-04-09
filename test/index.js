var assert = require('assert')
var ga = require('../lib/index')

describe('run', () => {
  it('should work', () => {
    var options = require('./support/string_solver')
    return ga.run(options).then((result) => {
      assert.equal(result.best.individual, 'hello, world!')
    })
  })
})
