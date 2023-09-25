const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // UUID 생성을 위한 모듈
const jwt = require('@aws-sdk/client-s3'); // JSON Web Token 생성 및 검증을 위한 모듈
const { DynamoDBClient, QueryCommand, GetItemCommand, PutItemCommand, ScanCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb"); // AWS DynamoDB와 상호 작용하기 위한 모듈
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3"); // AWS S3와 상호 작용하기 위한 모듈
const s3 = new S3Client({ region: 'ap-northeast-2' }); // AWS S3 클라이언트 생성
const cookieParser = require('cookie-parser'); // 쿠키 파싱을 위한 모듈
const multer = require('multer'); // 파일 업로드를 위한 모듈
const storage = multer.memoryStorage(); // 파일을 메모리에 저장
const upload = multer({ storage: storage }); // 메모리 스토리지를 사용하여 파일 업로드 구성
const path = require('path'); // 파일 경로를 다루기 위한 모듈
const app = express();

app.use(cors()); // CORS 미들웨어 설정
app.use(express.json()); // JSON 파싱 미들웨어 설정
app.use(cookieParser()); // 쿠키 파싱 미들웨어 설정
app.use(express.urlencoded({ extended: true })); // URL 인코딩 미들웨어 설정
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공을 위한 미들웨어 설정

const dynamodb = new DynamoDBClient({ region: 'ap-northeast-2' }); // AWS DynamoDB 클라이언트 생성
const tableName = 'Account'; // DynamoDB 테이블 이름


// 사용자가 존재하는지 확인하는 비동기 함수
async function isUserExists(userId) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: 'UserId = :id',
    ExpressionAttributeValues: { ':id': { S: userId } },
  };

  try {
    const command = new QueryCommand(params);
    const response = await dynamodb.send(command);
    return response.Items.length > 0;
  } catch (error) {
    console.error('오류 발생:', error);
    return false;
  }
}


// 사용자 이름이 이미 존재하는지 확인하는 비동기 함수
async function isUserNameExists(userName) {
  const params = {
    TableName: tableName,
    FilterExpression: 'UserName = :name',
    ExpressionAttributeValues: { ':name': { S: userName } },
  };

  try {
    const command = new ScanCommand(params); // QueryCommand 대신 ScanCommand 사용
    const response = await dynamodb.send(command);
    return response.Items.length > 0;
  } catch (error) {
    console.error('오류 발생:', error);
    return false;
  }
}


// 로그인이 필요한 미들웨어
function requireLogin(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ detail: "인증되지 않았습니다 - 로그인이 필요합니다." });
  }

  // "Bearer" 스킴으로 시작하는 Authorization 헤더를 파싱하여 토큰 추출
  const token = authorizationHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error("토큰 확인 오류:", error);
    return res.status(401).json({ detail: "인증되지 않았습니다 - 잘못된 토큰입니다." });
  }
}


// 사용자 로그인 처리
app.post("/account/login", async (req, res) => {
  const { user_id, password } = req.body;
  const data = { user_id }; // JSON 응답에 포함할 데이터 객체 생성
  console.log("사용자 ID를 사용하여 로그인 요청 받음:", user_id);

  if (!password) {
    return res.status(400).json({ detail: "패스워드를 입력하세요." });
  }

  try {
    const userExists = await isUserExists(user_id);

    console.log("사용자 존재 여부:", userExists);

    if (!userExists) {
      return res.status(401).json({ detail: "사용자를 찾을 수 없습니다." });
    }

    const token = jwt.sign({ user_id }, 'secret_key', { expiresIn: '10h' });
    res.cookie("token", token);

    // 데이터 객체에 token 추가
    data.token = token;

    return res.json(data); // JSON 응답으로 user_id와 token을 함께 반환
  } catch (error) {
    console.error('오류 발생:', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});



// 사용자 로그아웃 처리
app.post("/account/logout", requireLogin, (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "로그아웃 성공" });
});

// 사용자 회원가입 처리
app.post("/account/signup", async (req, res) => {
  const { user_id, user_name, password, passwordcheck } = req.body;

  if (await isUserExists(user_id)) {
    return res.status(400).json({ detail: "이미 존재하는 사용자 ID입니다." });
  }

  if (await isUserNameExists(user_name)) {
    return res.status(400).json({ detail: "이미 사용 중인 사용자 이름입니다." });
  }

  if (password !== passwordcheck) {
    return res.status(400).json({ detail: "패스워드가 일치하지 않습니다." });
  }

  const user_uuid = uuidv4();

  const params = {
    TableName: tableName,
    Item: {
      'UserId': { S: user_id },
      'UserName': { S: user_name },
      'Password': { S: password },
      'PasswordCheck': { S: passwordcheck },
      'UUID': { S: user_uuid },
    },
  };

  try {
    const command = new PutItemCommand(params);
    await dynamodb.send(command);
    return res.json({ message: "사용자 등록 완료", user_uuid: user_uuid });
  } catch (error) {
    console.error('오류 발생:', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 임시 비밀번호 생성 함수
function generateTemporaryPassword() {
  // 랜덤 임시 비밀번호 생성 로직 구현
  // 여기서는 간단한 임시 비밀번호 생성 로직 사용
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const temporaryPassword = Array.from({ length: 10 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
  return temporaryPassword;
}

app.post("/account/find/id", async (req, res) => {
  const { user_id } = req.body;

  try {
    const params = {
      TableName: tableName,
      FilterExpression: 'UserId = :id',
      ExpressionAttributeValues: { ':id': { S: user_id } },
    };

    const command = new ScanCommand(params);
    const response = await dynamodb.send(command);
    const usersWithSameId = response.Items;

    if (usersWithSameId.length === 0) {
      return res.status(404).json({ detail: "해당 ID의 사용자가 없습니다." });
    }

    // 사용자 이름 반환
    const userNames = usersWithSameId.map(user => user.UserName.S);

    return res.json({ user_names: userNames });
  } catch (error) {
    console.error('오류 발생:', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 사용자의 임시 비밀번호 발급 처리
app.post("/account/find/pw", async (req, res) => {
  const { user_id, user_name } = req.body;

  try {
    const params = {
      TableName: tableName,
      Key: {
        'UserId': { S: user_id },
        'UserName': { S: user_name },
      },
    };

    const command = new GetItemCommand(params);
    const response = await dynamodb.send(command);
    const userProfile = response.Item;

    if (!userProfile) {
      return res.status(404).json({ detail: "사용자를 찾을 수 없습니다." });
    }

    const newTemporaryPassword = generateTemporaryPassword();

    console.log("새로운 임시 패스워드:", newTemporaryPassword);

    const updateParams = {
      TableName: tableName,
      Key: {
        'UserId': { S: user_id },
        'UserName': { S: user_name },
      },
      UpdateExpression: 'SET Password = :password, PasswordCheck = :passwordCheck',
      ExpressionAttributeValues: {
        ':password': { S: newTemporaryPassword },
        ':passwordCheck': { S: newTemporaryPassword },
      },
    };

    const updateCommand = new UpdateItemCommand(updateParams);
    await dynamodb.send(updateCommand);

    return res.json({ message: "새로운 임시 패스워드가 발급되었습니다.", temporaryPassword: newTemporaryPassword });
  } catch (error) {
    console.error('패스워드 업데이트 중 오류 발생:', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 사용자 ID 찾기 처리
app.put("/account/profile", requireLogin, upload.single("profileImage"), async (req, res) => {
  const { user_id, user_name, introduction } = req.body;

  try {
    let profileImageUrl = null; // 프로필 사진 URL 초기화

    if (req.file) { // 프로필 사진이 업로드되었는지 확인
      const fileBuffer = req.file.buffer;
      const fileType = req.file.mimetype;
      const key = `profile_photos/${uuidv4()}.jpg`;

      const params = {
        Bucket: 'seo-3169',
        Key: key,
        Body: fileBuffer,
        ContentType: fileType,
      };

      await s3.send(new PutObjectCommand(params));

      profileImageUrl = `https://${params.Bucket}.s3.ap-northeast-2.amazonaws.com/${params.Key}`;
    }

    // 업데이트할 프로필 데이터 생성
    const updateParams = {
      TableName: 'Account',
      Key: {
        'UserId': { S: user_id }, // 파티션 키 설정
        'UserName': { S: user_name }, // 정렬 키 설정 (사용자의 정렬 키 값을 적절히 대체)
      },
      UpdateExpression: 'SET Introduction = :introduction', // 비밀번호 필드를 업데이트하지 않음
      ExpressionAttributeValues: {
        ':introduction': { S: introduction },
        // 비밀번호와 비밀번호 체크를 그대로 두기 위해 값을 설정하지 않음
      },
    };

    if (profileImageUrl) {
      // 프로필 이미지 URL이 있는 경우 추가로 업데이트합니다.
      updateParams.UpdateExpression += ', ProfileImageUrl = :profileImageUrl';
      updateParams.ExpressionAttributeValues[':profileImageUrl'] = { S: profileImageUrl };
    }

    await dynamodb.send(new UpdateItemCommand(updateParams));

    // 업데이트된 프로필 정보를 클라이언트에 반환합니다.
    const updatedProfile = {
      user_id,
      user_name,
      introduction,
      profileImageUrl,
    };

    return res.json({
      message: "프로필이 성공적으로 업데이트되었습니다.",
      profile: updatedProfile
    });
  } catch (error) {
    console.error('프로필 업데이트 중 오류 발생: ', error);
    return res.status(500).json({ detail: "프로필을 업데이트하는 중 오류가 발생했습니다." });
  }
});


app.post("/account/profile", requireLogin, async (req, res) => {
  const { user_id, user_name } = req.body; // 사용자의 정보는 POST 요청의 body에서 받아옵니다.

  try {
    // 사용자 프로필 데이터를 가져옵니다.
    const getParams = {
      TableName: 'Account',
      Key: {
        'UserId': { S: user_id }, // 파티션 키 설정
        'UserName': { S: user_name }, // 정렬 키 설정
      },
    };

    const getResponse = await dynamodb.send(new GetItemCommand(getParams));
    const userProfile = getResponse.Item;

    if (!userProfile) {
      return res.status(404).json({ detail: "사용자 프로필을 찾을 수 없습니다." });
    }

    // 프로필 정보를 클라이언트에 반환합니다.
    const profile = {
      user_id: userProfile.UserId.S,
      user_name: userProfile.UserName.S,
      introduction: userProfile.Introduction ? userProfile.Introduction.S : null,
      profileImageUrl: userProfile.ProfileImageUrl ? userProfile.ProfileImageUrl.S : null,
    };

    return res.json(profile);
  } catch (error) {
    console.error('프로필 조회 중 오류 발생: ', error);
    return res.status(500).json({ detail: "프로필을 조회하는 중 오류가 발생했습니다." });
  }
});



module.exports = app; // Express 애플리케이션을 내보내는 부분