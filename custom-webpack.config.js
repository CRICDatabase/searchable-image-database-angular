const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            $ENV: {
                CRIC_EMAIL: JSON.stringify(process.env.CRIC_EMAIL),
                CRIC_DOMAIN: JSON.stringify(process.env.CRIC_DOMAIN),
                CRIC_API_DOMAIN: JSON.stringify(process.env.CRIC_API_DOMAIN),
                CRIC_PLAYGROUND: JSON.stringify(process.env.CRIC_PLAYGROUND)
            }
        })
    ]
};
