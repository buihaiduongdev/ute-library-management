const bcrypt = require('bcrypt');

async function generateHashes() {
    const passwords = ['admin', 'staff', 'reader'];
    for (const pwd of passwords) {
        const hash = await bcrypt.hash(pwd, 10);
        console.log(`${pwd}: ${hash}`);
    }
}

generateHashes();
