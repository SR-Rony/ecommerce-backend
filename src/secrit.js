require("dotenv").config()
const mongosseUrl = process.env.MONGODB_URL;
const serverPort = process.env.SERVER_PORT || 8000;
const dbName=process.env.DB_NAME
const dbPassword=process.env.DB_PASSWORD
const jwtActivationKey = process.env.JWT_ACTIVATION_KEY || "iamsrrony707@1w23eqreafdv";
const jwtAccessKey = process.env.JWT_ACCESS_KEY || "iamsrrony707@1w23eqreafdv";
const jwtRefreshKey = process.env.JWT_REFRESH_KEY || "iamsrrony707@1w23eqreafdv";
const resetPasswordKey = process.env.JWT_RESET_PASSWORD_KEY || "iamsrrony707@1w23eqreafdvdfhtv";
const smtpUserName= process.env.SMTP_USERNAME || "hdronyrony@gmail.com"
const smtpPassword= process.env.SMTP_PASSWORD || 'gacu eqmg lpxj qjel'
// const defaulUserImg = process.env.DEFAULT_USER_IMG || "public/images/user/defaul_user.png"
const defaulUserImg ="public/images/user/defaul_user.png"
const clientUrl =process.env.CLIENT_URL || "http://localhost:3000"



module.exports = {
    mongosseUrl,
    serverPort,
    defaulUserImg,
    jwtActivationKey,
    smtpUserName,
    smtpPassword,
    clientUrl,
    dbName,
    dbPassword,
    jwtAccessKey,
    resetPasswordKey,
    jwtRefreshKey
}