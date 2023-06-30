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

  if (newFile) {
    const extension = newFile.name.split('.')[1];
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'jfif', 'exif', 'tiff', 'bmp', 'gif'];

    if (!allowedExtensions.includes(extension) || !newFile.type.startsWith('image/')) {
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
      window.location.replace(`/home.html?id=${user_id}`);
    },
  });
}

userInfoEditBtn.addEventListener('submit', userInfoEdit);
