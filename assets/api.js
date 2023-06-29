const $name = document.querySelector('#name');
const $pwd = document.querySelector('#pwd');
const $email = document.querySelector('#email');
const $imageUrl = document.querySelector('#imageUrl');
const $petName = document.querySelector('#petName');
const $onLiner = document.querySelector('#onLiner');
const $afterPwd = document.querySelector('#afterPwd');
const $confirmPwd = document.querySelector('#confirmPwd');
const $logoutBtn = document.querySelector('.logoutBtn');

const $title = document.querySelector('#title');
const $content = document.querySelector('#content');

const { User } = require('../models');
async function userInfoEditBtn(userEmail, callback) {
  const user = await User.findOne({ where: { email: userEmail } });
  $.ajax({
    type: 'PUT',
    url: `/login/${user.userId}`,
    data: {
      email: $email,
      name: $name,
      beforePassword: $pwd,
      afterPassword: $afterPwd,
      confirmPassword: $confirmPwd,
      oneLiner: $onLiner,
      petName: $petName,
      imageUrl: $imageUrl,
    },
    error: function (xhr, status, error) {
      if (status == 400) {
        alert('존재하지 않는 정보입니다.');
      }
      window.location.href = '/home.html';
    },
    success: function () {
      callback();
    },
  });
}

$logoutBtn.addEventListener('click', () => {
  $.ajax({
    type: 'DELETE',
    url: `/logout/${userId}`,
    error: function (xhr, status, error) {
      if (status == 400) {
        alert('존재하지 않는 정보입니다.');
      }
      window.location.href = '/';
    },
    success: function () {
      callback();
    },
  });
});


function savePost() {
  let title = $title;
  let content = $content;
  $.ajax({
    type: 'POST',
    url: `/posts`,
    data: {
      title: title,
      content: content,
    },
    error: function (xhr, status, error) {
      if (status == 400) {
        alert('존재하지 않는 정보입니다.');
      }
      window.location.href = '/home.html';
    },
    success: function () {
      callback();
    },
  });
}

function printPosts(callback) {
  $('.postBox').empty();
  $.ajax({
    type: 'GET',
    url: `/posts`,
    success: function (response) {
      callback(response['posts']);
    },
  });
}
