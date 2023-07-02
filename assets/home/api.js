document.addEventListener('DOMContentLoaded', () => {});
//회원가입 form
const signUpSubmitBtn = document.querySelector('.signUpForm');
async function signUp(event) {
  event.preventDefault();
  const form = new FormData();
  const email = document.querySelector('#signUpEmail').value;
  const name = document.querySelector('#signUpName').value;
  const password = document.querySelector('#signUpPwd').value;
  const confirmPassword = document.querySelector('#signUpConfirmPwd').value;
  const pet_name = document.querySelector('#signUpPetName').value;
  const newFile = document.querySelector('#newFile').files[0];
  if (newFile) {
    const extension = newFile.name.split('.');
    //만약 이름이 ... 일경우를 제일 뒷값이 파일값
    let index = 0;
    for (let i in extension) {
      index = i;
    }
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'jfif', 'exif', 'tiff', 'bmp', 'gif'];
    if (!allowedExtensions.includes(extension[index]) || !newFile.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    form.append('newFile', newFile);
  }
  form.append('email', email);
  form.append('name', name);
  form.append('password', password);
  form.append('confirmPassword', confirmPassword);
  form.append('pet_name', pet_name);
  $.ajax({
    type: 'POST',
    url: `/signup`,
    processData: false,
    contentType: false,
    data: form,
    error: function (error) {
      alert(error.responseJSON.errorMessage);
    },
    success: function (response) {
      alert(response.message);
      window.location.href = '/';
    },
  });
}
signUpSubmitBtn.addEventListener('submit', signUp);

const searchPosts = document.querySelector('.search');
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
      //밑 사진만 뜨는 박스
      //최신순 공간에 검색한 정보 출력
      $('.postImgBox').empty();
      posts.forEach((post, idx) => {
        let img = '';
        let likes = posts[idx].Likes.length;
        post.image_url
          ? (img = post.image_url)
          : (img = '<img src="../image/defaultImage.jpg" class="postImage" alt= />');
        let date =
          '작성일자: ' + post.created_at.substring(0, 10).replace('-', '.').replace('-', '.');
        const postInnerHtml = `<div class="postBottomBox" onclick="postDetail(${post.post_id})">
                                <div class="imgBox">${img}</div>
                                <p style="text-align:center;">${post.title}</p>
                                <p style="text-align:center;">👍:${likes}</p>
                                <p style="text-align:center;">${date}</p>
                              </div>`;
        $('.postImgBox').append(postInnerHtml);
      });
    },
    error: (error) => {
      alert(error.responseJSON.errorMessage);
    },
  });
}
searchPosts.addEventListener('submit', searchPost);
