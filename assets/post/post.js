$(document).ready(() => {
  setTimeout(() => {
    getPosts();
  }, 1000);
});

const printPosts = document.querySelector('.printPosts');
const searchPosts = document.querySelector('.search');
const loginInfoBtn = document.querySelector('#loginInfoBtn');
const loginInfo = document.querySelector('#loginInfo');

//전체 게시글 출력
function getPosts() {
  $.ajax({
    method: 'GET',
    url: '/posts',
    success: (data) => {
      let posts = data.posts;
      let results = [];
      posts.forEach((post, idx) => {
        let Img = '';
        post.image_url
          ? (Img = post.image_url)
          : (Img = '<img src="../image/defaultImage.jpg" id="priview" class="postImage" />');
        let likes = posts[idx].Likes.length;
        results += `
          <div class="post" >
            <label class="postTitle">${post.title}</label>
            <label class="postUserName">${post.Name}</label>
            <div postDetailId=${post.post_id} onclick="postDetail(this)">
              ${Img} 
            </div>
            <label class="createdAtPost">${
              '작성일자: ' + post.created_at.substring(0, 10).replace('-', '.').replace('-', '.')
            }</label>
            <label class="like" countPostId=${
              post.post_id
            } onclick="countLike(this)">👍 ${likes}</label>
            <div class="buttons">
              <button type="button" onclick="modifyPost(this)" class="btn btn-outline-warning" 
                modifyPostId="${post.post_id}" modifyUserId="${post.User_id}">수정
                </button>
              <button type="button" onclick="deletePost(this)" class="btn btn-outline-danger" 
                deletePostId="${post.post_id}">삭제
              </button>
 
            </div>
          </div>`;
      });
      printPosts.innerHTML = results;
    },
    error: (err) => {
      alert(err.responseJSON.errorMessage);
    },
  });
}

//게시글 수정
function modifyPost(Ids) {
  const [post_id, user_id] = [Ids.getAttribute('modifyPostId'), Ids.getAttribute('modifyUserId')];
  $.ajax({
    type: 'GET',
    url: `/accessRight/${user_id}`,
    success: function (data) {
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
      console.log(data);
      alert(data.message);
      getPosts();
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
        getPosts();
      } else {
        alert(data.errorMessage);
      }
    },
    error: (error) => {
      alert(error.responseJSON.errorMessage);
    },
  });
}

//검색
function searchPost(event) {
  event.preventDefault();
  const searchInput = document.querySelector('#search-post').value;
  const category = document.querySelector('#search-options').value;
  let obj = {
    searchInput,
    category,
  };
  console.log(obj);
  $.ajax({
    type: 'POST',
    url: '/lookup',
    data: JSON.stringify(obj),
    contentType: 'application/json',
    success: function (data) {
      let posts = data.searchPosts;
      let results = [];
      posts.forEach((post, idx) => {
        let Img = '';
        post.image_url
          ? (Img = post.image_url)
          : (Img = '<img src="../image/defaultImage.jpg" class="postImage" />');

        let likes = posts[idx].Likes.length;
        results += `
          <div class="post" postDetailId=${post.post_id}>
            <label class="postTitle">${post.title}</label>
            <label class="postUserName">${post.Name}</label>
            <div>
              ${Img} 
            </div>
            <label class="createdAtPost">${
              '작성일자: ' + post.created_at.substring(0, 10).replace('-', '.').replace('-', '.')
            }</label>
            <label class="like" countPostId=${
              post.post_id
            } onclick="countLike(this)">👍 ${likes}</label>
            <div class="buttons">
              <button type="button" onclick="modifyPost(this)" class="btn btn-outline-warning" modifyPostId="${
                post.post_id
              }" modifyUserId="${post.User_id}">수정</button>
              <button type="button" onclick="deletePost(this)" class="btn btn-outline-danger" deletePostId="${
                post.post_id
              }">삭제</button>
 
            </div>
          </div>`;
      });
      printPosts.innerHTML = results;
    },
    error: (error) => {
      alert(error.responseJSON.errorMessage);
    },
  });
}

function postDetail(id) {
  const postId = id.getAttribute('postDetailId');
  window.open(`../detailPost/detailPost.html?postId=${postId}`, '_self');
}

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

searchPosts.addEventListener('submit', searchPost);
loginInfoBtn.addEventListener('click', showLoginInfo);
