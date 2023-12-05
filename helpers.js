//Function to find users by email
const getUserIDByEmail = (email, users) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
  return false;
};

// Function to generate a random alphanumeric string that's 6 characters long
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
}

module.exports = { getUserIDByEmail, generateRandomString };