const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers.js');

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

const testUrlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
  "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user);
  });
});

describe('urlsForUser', function() {
  it('should return URLs that belong to the specified user', function() {
    const result = urlsForUser('user1', testUrlDatabase);
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the user has no URLs', function() {
    const result = urlsForUser('user3', testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const result = urlsForUser('user1', {});
    const expectedOutput = {};
    assert.deepEqual(result, expectedOutput);
  });

  it('should not return URLs that do not belong to the specified user', function() {
    const result = urlsForUser('user2', testUrlDatabase);
    const expectedOutput = {
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" }
    };
    assert.deepEqual(result, expectedOutput);
  });
});
