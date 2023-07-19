function searchParam(key) {
  return new URLSearchParams(location.search).get(key);
}

$(document).ready(() => {
  const postId = searchParam('postId');
  if (!postId) {
    alert('잘못된 접근 입니다.');
    window.location.href = '../post/post.html';
  }
  getPost(postId);
  getComment(postId);
});

const commentBtn = document.querySelector('#commentBtn');
const loginInfoBtn = document.querySelector('#loginInfoBtn');
const loginInfo = document.querySelector('#loginInfo');

getPost = (postId) => {
  $.ajax({
    method: 'GET',
    url: `/posts/${postId}`,
    success: (post) => {
      const { title, content, image_url, post_id, User_id } = post.post;
      const likes = post.post.Likes.length;
      if (image_url) {
        imgUrl = image_url;
        document.querySelector('#postImg').innerHTML = image_url;
      }
      document.querySelector('#title').innerHTML = title;
      document.querySelector('#content').innerHTML = content;

      document.querySelector(
        '.postBtnBox',
      ).innerHTML = `<button type="button" onclick="deletePost(this)" class="btn btn-outline-danger" 
                        deletePostId="${post_id}">삭제
                    </button>
                    <button type="button" onclick="modifyPost(this)" class="btn btn-outline-warning" 
                        modifyPostId="${post_id}" modifyUserId="${User_id}">수정
                    </button>
                    <label class="like" countPostId=${post_id} onclick="countLike(this)">👍 ${likes}</label>
                    `;
    },
    error: (err) => {
      alert(err.responseJSON.errorMessage);
      window.location.href = '../post/post.html';
    },
  });
};

getComment = (postId) => {
  $.ajax({
    method: 'GET',
    url: `/posts/${postId}/comments`,
    success: (data) => {
      const comments = data.comments;
      comments.forEach((e) => {
        const { name, comment, Post_id, User_id, comment_id } = e;
        document.querySelector('.postComments').innerHTML += `<div>
                    <div class="card border-secondary mb-3" id="commentBox" style="max-width: 18rem;">
                        <div class="card-header">${name}</div>
                        <div class="card-body text-secondary">
                        <p class="card-text">${comment}</p>
                        <div class="btnBox">
                        <button type="button" onclick="deleteComment(this)" class="btn btn-outline-danger" 
                            deletePostId="${Post_id}" deleteCommentId="${comment_id}">삭제
                        </button>
                        <button type="button" onclick="modifyComment(this)" class="btn btn-outline-warning" 
                            modifyPostId="${Post_id}" modifyCommentId="${comment_id}" modifyUserId="${User_id}">수정
                        </button>
                        </div>
                    </div> 
                    </div>`;
      });
    },
    error: (err) => {
      alert(err.responseJSON.errorMessage);
    },
  });
};

//게시글 수정
function modifyPost(Ids) {
  const [post_id, user_id] = [Ids.getAttribute('modifyPostId'), Ids.getAttribute('modifyUserId')];
  $.ajax({
    type: 'GET',
    url: `/accessRight/${user_id}`,
    success: (data) => {
      if (data.message) {
        window.open(`../writePost/writePost.html?postId=${post_id}`, '_self');
      }
    },
    error: () => {
      alert('게시글 수정 권한이 없습니다.');
      return;
    },
  });
}

//게시글 삭제
function deletePost(post) {
  const postId = post.getAttribute('deletePostId');
  $.ajax({
    type: 'DELETE',
    url: `/posts/${postId}`,
    success: (data) => {
      alert(data.message);
      window.location.href = '../post/post.html';
    },
    error: (error) => {
      alert(error.responseJSON.errorMessage);
    },
  });
}

//좋아요 올리기
function countLike(post) {
  const postId = post.getAttribute('countPostId');
  $.ajax({
    type: 'POST',
    url: `/posts/${postId}/like`,
    success: function (data) {
      const message = data.message;
      if (message) {
        alert(data.message);
        getPost(postId);
      } else {
        alert(data.errorMessage);
      }
    },
    error: (error) => {
      alert(error.responseJSON.errorMessage);
    },
  });
}

async function saveComment() {
  const comments = await document.querySelector('#comments').value;
  const postId = searchParam('postId');

  $.ajax({
    type: 'POST',
    url: `/posts/${postId}/comments`,
    data: {
      comments,
    },
    success: (data) => {
      alert(data.message);
      window.location.reload();
    },
    error: (error) => {
      alert(error.responseJSON.errorMessage);
    },
  });
}

function deleteComment(Ids) {
  const [PostId, commentId] = [
    Ids.getAttribute('deletePostId'),
    Ids.getAttribute('deleteCommentId'),
  ];
  $.ajax({
    type: 'DELETE',
    url: `/posts/${PostId}/comments/${commentId}`,
    success: (data) => {
      alert(data.message);
      document.querySelector('.postComments').innerHTML = '';
      getComment(PostId);
    },
    error: (error) => {
      alert(error.responseJSON.errorMessage);
    },
  });
}

async function modifyComment(Ids) {
  const [PostId, commentId, UserId] = [
    Ids.getAttribute('modifyPostId'),
    Ids.getAttribute('modifyCommentId'),
    Ids.getAttribute('modifyUserId'),
  ];
  await $.ajax({
    type: 'GET',
    url: `/accessRight/${UserId}`,
    success: async (data) => {
      if (data.message) {
        const comment = prompt('수정할 댓글을 입력해 주세요.');
        await $.ajax({
          type: 'PUT',
          url: `/posts/${PostId}/comments/${commentId}`,
          data: { comment },
          success: (data) => {
            alert(data.message);
            document.querySelector('.postComments').innerHTML = '';
            getComment(PostId);
          },
          error: (error) => {
            alert(error.responseJSON.errorMessage);
          },
        });
      }
    },
    error: () => {
      alert('댓글 수정 권한이 없습니다.');
      return;
    },
  });
}

commentBtn.addEventListener('click', saveComment);

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
      showLoginInfo();
    },
    error: (error) => {
      alert(error.responseJSON.errorMessage);
    },
  });
}

loginInfoBtn.addEventListener('click', showLoginInfo);
