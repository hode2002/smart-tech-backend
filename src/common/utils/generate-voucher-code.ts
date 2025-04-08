import * as otpGenerator from 'otp-generator';

export const generateCode = (len = 10) => {
    return otpGenerator.generate(len, {
        specialChars: false,
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
    });
};
