const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const htmlFilePath = path.join(__dirname, '../public/index.html');
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: htmlContent,
  };
};
