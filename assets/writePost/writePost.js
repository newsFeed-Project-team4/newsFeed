function searchParam(key) {
  return new URLSearchParams(location.search).get(key);
}

$(document).ready(() => {
  $.ajax({
    type: 'GET',
    url: '/loginUserInfo',
    error: (error) => {
      alert(error.responseJSON.errorMessage);
      window.location.href = '/';
    },
  });
  const postId = searchParam('postId');
  if (postId) {
    getPost(postId);
  }
});

getPost = (postId) => {
  $.ajax({
    method: 'GET',
    url: `/posts/${postId}`,
    success: (data) => {
      const { title, content } = data.post;

      document.querySelector('#postTitle').value = title;
      document.querySelector('#postContent').value = content;
    },
  });
};

const postId = searchParam('postId');
const postSubmitBtn = document.querySelector('#postSubmit');
const loginInfoBtn = document.querySelector('#loginInfoBtn');
const loginInfo = document.querySelector('#loginInfo');

async function savePost() {
  const form = new FormData();

  const title = document.querySelector('#postTitle').value;
  const content = document.querySelector('#postContent').value;
  const newFile = document.querySelector('#formFile').files[0];

  //사진의 버퍼를 가져올 수 있는데 이 버퍼를 이미지 태그로 걸어둘 수 있음(mimetype설정)
  console.log(newFile);
  try {
    if (newFile) {
      form.append('newFile', newFile);
    }

    form.append('title', title);
    form.append('content', content);

    await fetch('/posts', {
      method: 'POST',
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        const errorMessage = data.errorMessage;
        // 게시글 작성 완료 시 메인 페이지로 이동
        if (errorMessage) {
          alert(errorMessage);
        } else {
          alert(data.message);
          window.location.href = '/post/post.html';
        }
      });
  } catch (error) {
    alert(error);
  }
}

async function modifyPost() {
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
    await fetch(`/posts/${postId}`, {
      method: 'PUT',
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
          window.location.href = '/post/post.html';
        }
      });
  } catch (error) {
    // console.log(error.responseJSON.errorMessage);
  }
}

postSubmitBtn.addEventListener('click', () => {
  if (!postId) {
    savePost();
  } else {
    modifyPost();
  }
});

function showLoginInfo() {
  if (loginInfo.style.display === 'none') {
    loginInfo.innerHTML = '';
    $.ajax({
      type: 'GET',
      url: '/loginUsersInfo',
      success: (data) => {
        let result = data.users;
        result.forEach((user, idx) => {
          if (idx === 0) {
            loginInfo.innerHTML += `<div id="login">
                                      <label class="userName" style="color:red">현재 로그인 중 : ${user.User.email}</label>
                                      <button type="button" onclick="logoutId(this)" class="btn btn-outline-danger" userId="${user.User_id}" id="logoutBtn">로그 아웃</button>
                                      <button type="button" onclick="switchId(this)" class="btn btn-outline-warning"  userId="${user.User_id}" id="switchBtn">계정 전환</button>
                                    </div>`;
          } else {
            loginInfo.innerHTML += `<div id="login">
                                      <label class="userName">접속자 : ${user.User.email}</label>
                                      <button type="button" onclick="logoutId(this)" class="btn btn-outline-danger" userId="${user.User_id}" id="logoutBtn">로그 아웃</button>
                                      <button type="button" onclick="switchId(this)" class="btn btn-outline-warning"  userId="${user.User_id}" id="switchBtn">계정 전환</button>
                                    </div>`;
          }
        });
      },
      error: () => {
        const label = document.createElement('label');
        loginInfo.style.width = '200px';
        label.style.marginLeft = '20px';
        label.style.fontSize = '20px';
        label.innerText = '로그인이 필요합니다.';
        loginInfo.appendChild(label);
      },
    });

    loginInfo.style.display = 'block';
  } else {
    loginInfo.style.display = 'none';
  }
}

function switchId(id) {
  const userId = id.getAttribute('userId');
  const password = prompt('해당 계정의 비밀번호를 입력해주세요.');
  $.ajax({
    type: 'POST',
    url: `/switchId/${userId}`,
    data: { password },
    success: (data) => {
      alert(data.message);
      // window.localStorage.removeItem('response');
      // const objString = JSON.stringify(data.existUserInfo);
      // localStorage.setItem('response', objString);
      showLoginInfo();
      // window.location.reload();
    },
    error: (error) => {
      alert(error.responseJSON.errorMessage);
    },
  });
}

function logoutId(id) {
  const userId = id.getAttribute('userId');
  const password = prompt('해당 계정의 비밀번호를 입력해주세요.');
  $.ajax({
    type: 'POST',
    url: `/logout/${userId}`,
    data: { password },
    success: (data) => {
      alert(data.message);
      // const user_info = JSON.parse(localStorage.getItem('response'));
      // if (data.userInfo.User_id == user_info.User_id) {
      //   window.localStorage.removeItem('response');
      //   window.location.reload();
      // }
      window.location.reload();
    },
    error: (error) => {
      alert(error.responseJSON.errorMessage);
    },
  });
}

loginInfoBtn.addEventListener('click', showLoginInfo);
