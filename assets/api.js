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
