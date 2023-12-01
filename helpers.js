//Function to find users by email
const getUserIDByEmail = (email, users) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
  return false;
};

module.exports = { getUserIDByEmail };