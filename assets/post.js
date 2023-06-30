document.addEventListener('DOMContentLoaded', () => {});

const postSubmitBtn = document.querySelector('.postForm');

async function savePost(event) {
  event.preventDefault();

  const form = new FormData();

  const title = document.querySelector('#postTitle').value;
  const content = document.querySelector('#postContent').value;
  const newFile = document.querySelector('#newFile').files[0];

  form.append('newFile', newFile);
  form.append('title', title);
  form.append('content', content);

  await fetch('/posts', {
    method: 'POST',
    body: form,
  })
    .then((res) => res.json())
    .then((res) => {
      const errorMessage = res.errorMessage;
      // 게시글 작성 완료 시 메인 페이지로 이동
      if (errorMessage) {
        alert(res.errorMessage);
        window.location.reload();
      } else {
        alert(res.message);
        window.location.href = '/';
      }
    });
}

postSubmitBtn.addEventListener('submit', savePost);
