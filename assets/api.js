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

  const extension = newFile.name.split('.')[1];
  const allowedExtensions = ['png', 'jpg', 'jpeg', 'jfif', 'exif', 'tiff', 'bmp', 'gif'];

  if (!allowedExtensions.includes(extension) || !newFile.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.');
    return;
  }
  form.append('newFile', newFile);
  form.append('email', email);
  form.append('name', name);
  form.append('password', password);
  form.append('confirmPassword', confirmPassword);
  form.append('pet_name', pet_name);

  await fetch('/signup', {
    method: 'POST',
    body: form,
  })
    .then((res) => res.json())
    .then((res) => {
      const errorMessage = res.errorMessage;
      // 회원가입 완료 시 메인 페이지로 이동
      if (errorMessage) {
        alert(res.errorMessage);
      } else {
        alert(res.message);
        window.location.href = '/';
      }
    });
}

signUpSubmitBtn.addEventListener('submit', signUp);
