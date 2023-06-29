//게시글 작성
const $title = document.querySelector('#title');
const $content = document.querySelector('#content');

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
