const optGenerator = require('otp-generator');

const generateOTP = async () => {

    const options = {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    };

    // Generating Token
    const otp = optGenerator.generate(6, options);

    // Valid for 15 minutes
    const expiresAt = Date.now() + 15 * 60 * 1000;

    return { otp, expiresAt };
}

module.exports = generateOTP;