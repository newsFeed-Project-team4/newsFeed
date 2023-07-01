$(document).ready(() => {
  getPosts();
});

const printPosts = document.querySelector('.printPosts');
const searchPosts = document.querySelector('.search');

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
          : (Img = '<img src="../image/defaultImage.jpg" class="postImage" alt= />');

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
  const [postId, userId] = [Ids.getAttribute('modifyPostId'), Ids.getAttribute('modifyUserId')];
  window.open(`../writePost/writePost.html?postId=${postId}&userId=${userId}`, '_self');
}

//게시글 삭제
function deletePost(post) {
  const postId = post.getAttribute('deletePostId');
  $.ajax({
    type: 'DELETE',
    url: `/posts/${postId}`,
    success: function (data) {
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
          : (Img = '<img src="../image/defaultImage.jpg" class="postImage" alt= />');

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

searchPosts.addEventListener('submit', searchPost);
