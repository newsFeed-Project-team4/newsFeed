//회원 정보 수정 form
$(document).ready(() => {});

const userInfoEditBtn = document.querySelector('.userInfoEditForm');

async function userInfoEdit(event) {
  event.preventDefault();
  const user_id = urlParams.get('id');

  const form = new FormData();

  const name = document.querySelector('#name').value;
  const beforePassword = document.querySelector('#pwd').value;
  const afterPassword = document.querySelector('#afterPwd').value;
  const confirmPassword = document.querySelector('#confirmPwd').value;
  const pet_name = document.querySelector('#petName').value;
  const one_line_introduction = document.querySelector('#onLiner').value;
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

  form.append('name', name);
  form.append('beforePassword', beforePassword);
  form.append('afterPassword', afterPassword);
  form.append('confirmPassword', confirmPassword);
  form.append('one_line_introduction', one_line_introduction);
  form.append('pet_name', pet_name);

  $.ajax({
    type: 'PUT',
    url: `/login/${user_id}`,
    processData: false,
    contentType: false,
    data: form,
    error: function (error) {
      alert(error.responseJSON.errorMessage);
    },
    success: function (response) {
      window.localStorage.removeItem('response');
      const objString = JSON.stringify(response.userInfo);
      localStorage.setItem('response', objString);
      alert(response.message);
      window.location.replace(`/home/home.html?id=${user_id}`);
    },
  });
}

userInfoEditBtn.addEventListener('submit', userInfoEdit);

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
                                <p style="text-align:center;">👍${likes}</p>
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
