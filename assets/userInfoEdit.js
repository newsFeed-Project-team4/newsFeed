//회원 정보 수정 form
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

  const extension = newFile.name.split('.')[1];
  const allowedExtensions = ['png', 'jpg', 'jpeg', 'jfif', 'exif', 'tiff', 'bmp', 'gif'];

  if (!allowedExtensions.includes(extension) || !newFile.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.');
    return;
  }
  //   if (!newFile) newFile = user_info.image_url.file.path;
  form.append('newFile', newFile);
  form.append('name', name);
  form.append('beforePassword', beforePassword);
  form.append('afterPassword', afterPassword);
  form.append('confirmPassword', confirmPassword);
  form.append('one_line_introduction', one_line_introduction);
  form.append('pet_name', pet_name);

  await fetch(`/login/${user_id}`, {
    method: 'PUT',
    body: form,
  })
    .then((res) => res.json())
    .then((res) => {
      const errorMessage = res.errorMessage;
      // 회원 정보 수정 완료 시 홈페이지로 이동
      if (errorMessage) {
        alert(res.errorMessage);
      } else {
        window.localStorage.removeItem('response');
        const objString = JSON.stringify(res.userInfo);
        localStorage.setItem('response', objString);
        alert(res.message);
        window.location.replace(`/home.html?id=${user_id}`);
      }
    });
}

userInfoEditBtn.addEventListener('submit', userInfoEdit);
