document.addEventListener('DOMContentLoaded', () => {});
require('dotenv').config;
const env = process.env;

/* <div class="authForm" display="none"> */

//회원가입 form
const signUpSubmitBtn = document.querySelector('.signUpForm');
const sendEmailBtn = document.querySelector('.sendMail');
const emailAuthBtn = document.querySelector('.emailAuth');

async function signUp(event) {
  event.preventDefault();
  const form = new FormData();
  const name = document.querySelector('#signUpName').value;
  const password = document.querySelector('#signUpPwd').value;
  const confirmPassword = document.querySelector('#signUpConfirmPwd').value;
  const pet_name = document.querySelector('#signUpPetName').value;
  const email = document.querySelector('#signUpEmail').value;
  const newFile = document.querySelector('#newFile').files[0];

  if (document.querySelector('#signUpEmail').readOnly === false) {
    return alert('이메일 인증을 해주세요.');
  }

  if (newFile) {
    form.append('newFile', newFile);
  }
  form.append('email', email);
  console.log(email);
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

async function sendEmail() {
  const emailReg = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w)*(\.\w{2,3})+$/);
  const email = document.querySelector('#signUpEmail').value;
  const authForm = document.querySelector('.authForm');
  const emailAuth = document.querySelector('.emailAuth');
  let code, expire_time;

  if (!email || !emailReg.test(email)) {
    return alert('이메일이 비어 있거나 이메일이 형식에 맞지 않습니다.');
  }

  authForm.style = 'display: visible';

  await $.ajax({
    type: 'POST',
    url: '/sendMail',
    data: { email },
    success: (data) => {
      [code, expire_time] = [data.code, data.expire_time];
      alert(data.message);
    },
    error: (error) => {
      console.error(error);
      alert(error.responseJSON.errorMessage);
      authForm.style = 'display: none';
    },
  });

  emailAuth.addEventListener('click', () => {
    const authCode = document.querySelector('#authCode').value;

    if (authCode === code && Date.now() < expire_time) {
      alert('인증에 성공하셨습니다.');
      document.querySelector('#signUpEmail').readOnly = true;
      authForm.style = 'display:none';
      sendEmailBtn.style.display = 'none';
    } else {
      alert('인증에 실패하셨습니다. 다시 인증해주세요. ');
      document.querySelector('#signUpEmail').value = '';
      document.querySelector('#authCode').value = '';
    }
  });
}

sendEmailBtn.addEventListener('click', sendEmail);
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
                                <p style="text-align:center;">👍 ${likes}</p>
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

const kakaoLoginBtn = document.querySelector('.kakaoLogin');

function kakaoLogin() {
  window.location.href =
    `https://kauth.kakao.com/oauth/authorize?client_id=${env.KAKAO_RESTAPI_KEY}&redirect_uri=` +
    encodeURIComponent(`http://127.0.0.1:3018/socialLogin/kakao`) +
    '&response_type=code';
}

kakaoLoginBtn.addEventListener('click', kakaoLogin);
