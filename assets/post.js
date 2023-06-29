document.addEventListener('DOMContentLoaded', () => {});

const postSubmitBtn = document.querySelector('#postSubmit');

function savePost(event) {
  event.preventDefault();
  const formData = new FormData();

  const title = document.querySelector('#postTitle');
  const content = document.querySelector('#postContent');

  const newPost = {
    title: title,
    content: content,
  };

  fetch('http://127.0.0.1:3018/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newPost),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
}

postSubmitBtn.addEventListener('click', savePost);
