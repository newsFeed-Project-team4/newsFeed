let animalDataVisible = false;

// getJSON 함수 정의
function getJSON(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
    const status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
}

// displayAnimalData 함수 정의
function displayAnimalData(animalData) {
  const animalContainer = document.getElementById('animal-container');
  animalContainer.innerHTML = '';

  animalData.forEach(function (animal) {
    const animalInfo = document.createElement('div');
    animalInfo.innerHTML = `
      임시보호내용: ${animal.TMPR_PRTC_CN}<br>
      동물번호: ${animal.ANIMAL_NO}<br>
      이름: ${animal.NM}<br>
      입소날짜: ${animal.ENTRNC_DATE}<br>
      종: ${animal.SPCS}<br>
      품종: ${animal.BREEDS}<br>
      성별: ${animal.SEXDSTN}<br>
      나이: ${animal.AGE}<br>
      체중: ${animal.BDWGH}<br>
      입양상태: ${animal.ADP_STTUS}<br>
      임시보호상태: ${animal.TMPR_PRTC_STTUS}<br>
      소개동영상URL: ${animal.INTRCN_MVP_URL}<br>
      소개내용: ${animal.INTRCN_CN}<br><br>
    `;

    animalContainer.appendChild(animalInfo);
  });
}

// API 호출하여 동물 정보 가져오기
getJSON(
  'http://openapi.seoul.go.kr:8088/415244594d7061753130384e6a625647/json/TbAdpWaitAnimalView/1/5/',
  function (err, data) {
    if (err !== null) {
      console.log('예상치 못한 오류 발생: ' + err);
    } else {
      const animalData = data.TbAdpWaitAnimalView.row;
      displayAnimalData(animalData);
      animalDataVisible = true;
    }
  },
);
