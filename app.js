const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3018;
const db = require('./models');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');

db.sequelize.sync();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', [usersRouter, postsRouter, commentsRouter]);
app.use(express.static('./assets'));

app.listen(PORT, () => {
  console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
});
