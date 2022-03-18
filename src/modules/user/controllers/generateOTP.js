const optGenerator = require('otp-generator');


const generateOTP = async (size = 6, expireTimeInMin = 15) => {

    const options = {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    };

    // Generating Token
    const otp = optGenerator.generate(size, options);

    // Valid for 15 minutes
    const expiresAt = Date.now() + expireTimeInMin * 60 * 1000;

    return { otp, expiresAt };
}

module.exports = generateOTP;