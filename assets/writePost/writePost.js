const postSubmitBtn = document.querySelector('#postSubmit');

async function savePost(event) {
  event.preventDefault();

  const form = new FormData();

  const title = document.querySelector('#postTitle').value;
  const content = document.querySelector('#postContent').value;
  const newFile = document.querySelector('#formFile').files[0];
  try {
    if (newFile) {
      const extension =
        '.' +
        newFile.name
          .substring(newFile.name.length - 5, newFile.name.length)
          .toLowerCase()
          .split('.')[1];
      const allowedExtensions = [
        '.png',
        '.jpg',
        '.jpeg',
        '.jfif',
        '.exif',
        '.tiff',
        '.bmp',
        '.gif',
      ];

      if (!allowedExtensions.includes(extension) || !newFile.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      form.append('newFile', newFile);
    }

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
        } else {
          alert(res.message);
          window.location.href = '../post/post.html';
        }
      });
  } catch (error) {
    console.log(error);
  }
}

postSubmitBtn.addEventListener('click', savePost);
