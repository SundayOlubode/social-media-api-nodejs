const optGenerator = require('otp-generator');


const generateOTP = async ({ size, expireTimeInMin }) => {

    const options = {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    };

    // Generating Token
    const otp = optGenerator.generate(size || 6, options);

    // Valid for 15 minutes
    const expiresAt = Date.now() + (expireTimeInMin || 15) * 60 * 1000;

    return { otp, expiresAt };
}

module.exports = generateOTP;