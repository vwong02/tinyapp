const { assert } = require('chai');

const { getUserIDByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserIDByEmail', function() {

  it('should return a user with valid email', function() {
    const user = getUserIDByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.isTrue(expectedUserID === user);
  });

  it('should return undefined if no user email was found', function() {
    const user = getUserIDByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.isFalse(expectedUserID === undefined);
  });

});