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

getPost = (postId) => {
  $.ajax({
    method: 'GET',
    url: `/posts/${postId}`,
    success: (post) => {
      const { title, content, image_url, post_id, User_id } = post.post;
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
      alert('게시글 수정 권한이 없습니다.');
      return;
    },
  });
}

commentBtn.addEventListener('click', saveComment);
