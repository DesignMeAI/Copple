const AWS = require('aws-sdk');

AWS.config.update({
  region: "ap-northeast-2",
  accessKeyId: "AKIAU2356NLK65W4GRWW",
  secretAccessKey: "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"
});

module.exports = AWS;