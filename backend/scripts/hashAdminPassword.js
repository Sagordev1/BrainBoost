// Usage: node scripts/hashAdminPassword.js "your-admin-password"
// Copy the printed hash into ADMIN_PASSWORD_HASH in your .env file.
const bcrypt = require("bcryptjs");

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.error("Usage: node scripts/hashAdminPassword.js <password>");
  process.exit(1);
}

bcrypt.hash(plainPassword, 10).then((hash) => {
  console.log("\nADMIN_PASSWORD_HASH=" + hash + "\n");
});
