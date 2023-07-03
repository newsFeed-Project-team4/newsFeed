# newsFeed Team-cider

### 반려동물에 관한 뉴스피드(게시판, 댓글)

---

**기능**
- 게시글 및 댓글은 모두가 볼 수 있지만 수정 및 삭제는 회원가입과 로그인을 통한 사용자 인증을 기반으로 접근이 가능
- 회원가입 및 로그인에 대한 CRUD
  - 최초 회원가입 후 로그인 시 해당 사용자의 정보를 보여주고 고유 값 외의 정보를 수정할 수 있도록 함
    - 이메일은 형식에 맞춰야 하며 비밀번호는 4자 이상 그리고 프로필 사진을 업로드 할 수 있게끔 구성
    - 비밀번호는 bycrpt를 통한 단방향 hash 암호화를 통해 암호화 하도록 구현
  - 여러 사용자 정보로 동시 로그인이 가능하며 로그인된 계정에 대해 계정 전환 및 로그아웃이 가능
  - 계정 전환 및 로그아웃 시, 해당 사용자의 인증을 위해 비밀번호를 입력받아 비교 해 일치 시 실행
- 홈페이지에는 좋아요 순과 최신순의 각각 게시글이 보이도록 설정
  - 서울동물복지지원센터 입양대기동물 현황의 오픈 API를 가져와 입양이 필요한 분들을 위해 정보 제공
- 검색 기능을 통한 검색 가능(옵션(제목 / 제목+내용 / 제목+내용+작성자명)을 선택할 수 있어 다양한 형태로 검색이 가능)
- 게시글에 관한 CRUD
  - 게시글은 로그인된 사용자만 작성이 가능하며 작성한 게시글은 뉴스피드 공간에서 조회가 가능(홈과 동일하게 검색 가능)
    - 게시글 작성 시, 이미지 파일 첨부가 가능하며 해당 이미지 파일 첨부 시, 뉴스피드에 메인으로 나오는 사진에 들어감
    - 뉴스피드 공간에서 게시글을 클릭 시 상세 게시글로 이동해 유저가 올린 게시글의 내용과 이미지를 볼 수 있도록 함
  - 수정과 삭제는 해당 게시글을 작성한 사용자만 허용을 함으로 해당 게시글 작성자가 관리 가능
  - 좋아요를 눌러 해당 게시글을 추천할 수 있도록 구현(한 게시글당 중복된 사용자가 좋아요 누르는 것은 불가능)
    - 해당 좋아요가 제일 높은 인기 게시글을 홈 화면에서 보여줄 수 있도록 설정
- 댓글에 관한 CRUD
  - 해당 게시글의 상세 게시글로 들어가서 작성할 수 있도록 구현했고 작성하는 대로 바로 아래에 보여지도록 구현
  - 댓글 또한 해당 댓글을 작성한 사용자만이 수정과 삭제를 할 수 있도록 권한을 주어서 댓글을 관리 할 수 있도록 함

---

**상세 API** https://charming-castanet-ba9.notion.site/6d6ac355909a468389ac0b768ccc54e9?v=88c5842a6cb64659855e0b122837273d

**ERD**
![drawSQL--export-2023-06-29](https://github.com/newsFeed-Project-team4/newsFeed/assets/28723327/572cb8a5-e7ba-4868-911e-d10ced4b3932)

**와이어프레임** 
![1 drawio](https://github.com/newsFeed-Project-team4/newsFeed/assets/28723327/dfd7a375-fd7a-4439-8c1c-8c52697a4ed2)


---

**기능에 대한 코드 설명**
- accessToken 및 refreshToken
  - 여러 사용자의 로그인 및 계정 전환을 위해 accessToken / refreshToken 을 동시에 생성
  - accessToken은 만료기간을 1시간으로 정했고 refreshToken은 만료기간을 14일로 정함
  - 최초 로그인 시, 두 개가 동시에 생성이 되며 refreshToken이 만료되지 않는 이상 accessToken이 삭제되거나 만료기간을 넘기게 되더라도 refreshToken을 검증해 검증이 완료되면 새 accessToken이 발급되도록 구현
  - refreshToken이 만료되었을 때, accessToken이 만료되지 않았다면 그대로 사용이 가능하고 만일, accessToken도 만료가 되었다면 새로 로그인하라는 오류를 반환하면서 만료된 토큰을 삭제함

**accessToken / refreshToken**
- 쿠키에 저장할 accessToken과 db에 저장해서 사용할 refreshToken 두개를 발급받아 사용하도록 구현
- accessToken은 만료기간을 1시간으로 정했고 refreshToken은 만료기간을 14일로 정함
- 최초 로그인 시, 두 개가 동시에 생성이 되며 refreshToken이 만료되지 않는 이상 accessToken이
  - 삭제되거나 만료기간을 넘기게 되더라도 refreshToken을 검증해 검증이 완료되면 새 accessToken이 발급되도록 구현
- 처음에는 한 사용자만의 refreshToken을 저장하는 방식으로 구현을 했었고 (로그인 유지만 가능하도록)
  - 이후 여러 사용자가 로그인을 해서 로그아웃 하지 않는 이상 사용자 계정 전환을 할 수 있도록 구현
- refreshToken이 만료되었을 때, accessToken이 만료되지 않았다면 그대로 사용이 가능하고
  - 만일, accessToken도 만료가 되었다면 새로 로그인하라는 오류를 반환하면서 만료된 토큰을 삭제함

**여러 로그인한 계정에 대한 관리**
- 여러 로그인된 계정 중 현재 활동 중인 유저 즉, 사용자 정보에 대한 CRUD가 가능한 사람은 제일 최근에 로그인을 시도한 유저로 설정
  - 로그인 할 때, refreshToken의 키 값은 변하지 않게 하고 DB에 지우고 새로 생성함으로 가장 최근에 접속한 유저로 식별
  - 로그인 현황은 현재 refreshToken에 들어있는 유저의 정보들만 가져와서 보여주도록 함
  - 계정 전환 시, 로그인과 동일하게 refreshToken의 키 값은 유지하면서 DB에 지우고 새로 생성해 최근 접속된 유저로 식별함
  - 로그아웃 시, 지정한 유저의 정보의 refreshToken을 삭제하고 만약 로그아웃하는 아이디가 현재 활동 중인 유저라면 쿠키 값까지 삭제함으로서 그 다음에 로그인이 되어야 할 유저의 accessToken을 발급 받을 수 있도록 설정
    - 다음 유저가 만약 refreshToken이 만료가 되었다면 같은 작업을 반복해 그 다음 유저가 로그인이 된 상태가 유지 되도록 설정
   
**이미지 파일 업로드**
- upload 미들웨어를 만들어서 해당 미들웨어를 s3와 연결하고 파일을 입력 받았을 때 해당 파일을 검증 후 AWS s3에 업로드 후 해당 파일에 대한 경로를 받아 경로를 DB에 저장
  - 최초에는 multer의 diskStorage를 통해 직접적으로 이미지를 저장했으나 비효율적이라 생각이 들어 multer-s3로 변경
  - 이미지 확장자이거나 mimetype이 image로 시작하는 파일만 들어오도록 해서 이미지만 업로드 할 수 있도록 구현
  - 이미지를 업로드 하지 않았다면 기존에 저장한 기본 이미지를 업로드 해줌으로서 기본 이미지는 보여주도록 하나 실제 DB에 기본 이미지는 저장되지 않도록 구현
  - 같은 파일명이 들어왔을 때를 대비해 uuid4모듈로 uuid4객체를 만들었는데 만든 유일한 번호를 파일 이름에 할당 해 중복이 되지 않도록 설정

**좋아요**
- 하나의 게시글 당 한 명의 유저만 좋아요를 누를 수 있게끔 user_id와 post_id를 DB에 저장함으로 이미 좋아요를 누른 유저라면 취소가 되도록 함

**검색기능**
- 카테고리를 파라미터로 받아서 파라미터에 따라 검색 범위를 다르게 설정해서 검색한 결과를 출력하도록 구현
  - 제목이라면 제목만 제목+내용이면 내용까지 그리고 통합검색이라면 작성자의 이름까지 포함해서 검색