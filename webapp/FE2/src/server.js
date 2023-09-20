/* 서버를 만들기위한 기본 문법 */
const express = require('express');
const app = express();
const host = '3.39.153.9';
const port = 3000;

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}/`);
});
     