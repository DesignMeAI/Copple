const express = require('express');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, PutItemCommand, ScanCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const app = express();

const AWS_REGION = 'ap-northeast-2';

const s3Client = new S3Client({ region: AWS_REGION });
const dynamodbClient = new DynamoDBClient({ region: AWS_REGION });

// 쿠키 파서 및 다른 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 디버깅: 토큰이 올바르게 수신되었는지 확인
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


// 목표 생성 upload.single("image") 미들웨어가 사용되고 있으므로, 사용자가 이미지를 업로드하려면 요청에 image라는 필드를 포함해야 합니다. req.file객체에 저장됨.
app.post("/goal/create", requireLogin, upload.single("image"), async (req, res) => { //image가 req.file에 저장됨
  const user = req.user;
  const { title, startDatetime, endDatetime, location, content } = req.body;

  try {
    let imageUrl = null; // 이미지 URL 초기값 = null

    if (req.file) { // 이미지가 업로드되었는지 확인
      const fileBuffer = req.file.buffer; //buffer에 저장됨, 이후 S3에 업로드할 때 사용됨
      const fileType = req.file.mimetype; //jpg, png등 다양한 형태의 img파일 지원
      const userId = user.user_id; //현재 사용자의 ID를 가져옴, 나중에 이미지 저장 경로, 식별자 등에 사용
      const key = `travel_photos/${uuidv4()}.jpg`;

      const params = { //S3에 업로드하기 이해 필요한 정보 설정.
        Bucket: 'seo-3169',
        Key: key,
        Body: fileBuffer,
        ContentType: fileType,
      };

      await s3Client.send(new PutObjectCommand(params)); //이미지를 S3에 저장

      imageUrl = `https://${params.Bucket}.s3.ap-northeast-2.amazonaws.com/${params.Key}`; //1. 클라이언트 업로드 이미지 2. S3저장 3. 이미지 URL = imageUrl 변수에 저장
    }

    // 나머지 데이터와 함께 DynamoDB에 저장
    const event_id = uuidv4();
    const eventType = 'Goal';
    const completeStatus = '미완료'; // 목표 생성 시 기본적으로 "미완료" 상태로 설정

    const eventParams = {
      TableName: 'Event',
      Item: { //실제 데이터 들어감
        'EventId': { S: event_id },
        'UserId': { S: user.user_id },
        'EventType': { S: eventType },
        'Title': { S: title },
        'StartDatetime': { S: startDatetime },
        'EndDatetime': { S: endDatetime },
        'Location': { S: location },
        'Content': { S: content },
        'CompletionStatus': { S: completeStatus }, // "CompletionStatus" 필드를 기반으로 "isCompleted" 필드 설정
      },
    };

    if (imageUrl) { //imageUrl = 이 존재하면 Item 필드에 PhotoURL 추가
      eventParams.Item['PhotoURL'] = { S: imageUrl };
    }

    await dynamodbClient.send(new PutItemCommand(eventParams));//eventParams값 받아서 DynamoDB에 넣는다.

    const goalData = { //goalData에 다 때려박음, 나중에 Client(Front)에서 데이터 사용할 때 유용함.
      event_id,
      user_id: user.user_id,
      eventType,
      title,
      startDatetime,
      endDatetime,
      location,
      content,
      photoUrl: imageUrl,
      isCompleted: completeStatus === '완료',
    };

    return res.status(200).json({
      event_id,
      message: "목표가 성공적으로 생성되었습니다.",
      goalData
    });
  } catch (error) {
    console.error('An error occurred while creating the goal with image: ', error);
    return res.status(500).json({ detail: "목표를 생성하는 중 오류가 발생했습니다." });
  }
});


// 목표 전체 조회
app.get("/goal/read", requireLogin, async (req, res) => {
  const user = req.user;
  const eventType = 'Goal';

  const params = {
    TableName: 'Event',
    FilterExpression: 'UserId = :userId AND EventType = :eventType',
    ExpressionAttributeValues: {
      ':userId': { S: user.user_id },
      ':eventType': { S: eventType },
    }
  };

  try {
    const command = new ScanCommand(params);
    const response = await dynamodbClient.send(command);

    const goals = response.Items.map(item => ({
      event_id: item.EventId.S,
      user_id: item.UserId.S,
      eventType: item.EventType.S,
      title: item.Title.S,
      startDatetime: item.StartDatetime.S,
      endDatetime: item.EndDatetime.S,
      location: item.Location.S,
      content: item.Content.S,
      photoUrl: item.PhotoURL ? item.PhotoURL.S : null,
      isCompleted: item.CompletionStatus ? item.CompletionStatus.S === '완료' : false, // "CompletionStatus" 필드를 기반으로 "isCompleted" 값을 설정
    }));

    return res.status(200).json(goals);
  } catch (error) {
    console.error('An error occurred while fetching goals: ', error);
    return res.status(500).json({ detail: "목표 목록을 불러오는 중 오류가 발생했습니다." });
  }
});

// 사용자가 특정 날짜를 클릭할 때 해당 날짜의 목표를 가져오는 API
app.get("/goal/readByDate/:date", requireLogin, async (req, res) => {
  const user = req.user;
  const date = req.params.date; // 클라이언트에서 전달한 날짜

  // 날짜를 기준으로 DynamoDB에서 목표 목록을 조회합니다.
  const params = {
    TableName: 'Event',
    FilterExpression: 'UserId = :userId AND EventType = :eventType AND StartDatetime <= :date AND EndDatetime >= :date',
    ExpressionAttributeValues: {
      ':userId': { S: user.user_id },
      ':eventType': { S: 'Goal' },
      ':date': { S: date },
    }
  };

  try {
    const command = new ScanCommand(params);
    const response = await dynamodbClient.send(command);

    const goals = response.Items.map(item => ({
      event_id: item.EventId.S,
      user_id: item.UserId.S,
      eventType: item.EventType.S,
      title: item.Title.S,
      startDatetime: item.StartDatetime.S,
      endDatetime: item.EndDatetime.S,
      location: item.Location.S,
      content: item.Content.S,
      photoUrl: item.PhotoURL ? item.PhotoURL.S : null,
      isCompleted: item.Complete && item.Complete.BOOL ? true : false, // "Complete" 필드를 기반으로 "isCompleted" 값을 설정
    }));

    // 클라이언트에게 목표 목록을 반환합니다.
    return res.json(goals);
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ detail: '내부 서버 오류' });
  }
});

app.get("/goal/read/:event_id", requireLogin, async (req, res) => {
  const user = req.user;
  const event_id = req.params.event_id; // 클라이언트에서 전달한 event_id

  // DynamoDB에서 해당 event_id를 가진 목표 정보를 조회합니다.
  const params = {
    TableName: 'Event',
    Key: {
      'EventId': { S: event_id },
    },
  };

  try {
    const command = new GetItemCommand(params);
    const response = await dynamodbClient.send(command);

    if (!response.Item) {
      // 해당 event_id를 가진 목표가 없을 경우 404 응답을 반환할 수 있습니다.
      return res.status(404).json({ detail: '해당 목표를 찾을 수 없습니다.' });
    }

    // 조회된 목표 정보를 클라이언트에게 반환합니다.
    const goal = {
      event_id: response.Item.EventId.S,
      user_id: response.Item.UserId.S,
      eventType: response.Item.EventType.S,
      title: response.Item.Title.S,
      startDatetime: response.Item.StartDatetime.S,
      endDatetime: response.Item.EndDatetime.S,
      location: response.Item.Location.S,
      content: response.Item.Content.S,
      photoUrl: response.Item.PhotoURL ? response.Item.PhotoURL.S : null,
      isCompleted: response.Item.Complete && response.Item.Complete.BOOL ? true : false,
    };

    return res.json(goal);
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ detail: '내부 서버 오류' });
  }
});

// 목표 수정
app.put("/goal/update/:event_id", requireLogin, upload.single("image"), async (req, res) => {
  const event_id = req.params.event_id;
  const { title, startDatetime, endDatetime, location, content } = req.body;

  try {
    let imageUrl = null; // 이미지 URL 초기화

    if (req.file) { // 이미지가 업로드되었는지 확인
      const fileBuffer = req.file.buffer;
      const fileType = req.file.mimetype;
      const userId = req.user.user_id; // req.user를 사용하여 사용자 ID를 가져옵니다.
      const key = `travel_photos/${uuidv4()}.jpg`;

      const params = {
        Bucket: 'seo-3169',
        Key: key,
        Body: fileBuffer,
        ContentType: fileType,
      };

      await s3Client.send(new PutObjectCommand(params));

      imageUrl = `https://${params.Bucket}.s3.ap-northeast-2.amazonaws.com/${params.Key}`;
    }

    // 업데이트할 필드 목록 초기화
    const updateFields = [];
    const expressionAttributeValues = {};

    // 필드가 주어진 경우에만 해당 필드를 업데이트 목록에 추가
    if (title) {
      updateFields.push('#title = :title');
      expressionAttributeValues[':title'] = { S: title };
    }
    if (startDatetime) {
      updateFields.push('#startDatetime = :startDatetime');
      expressionAttributeValues[':startDatetime'] = { S: startDatetime };
    }
    if (endDatetime) {
      updateFields.push('#endDatetime = :endDatetime');
      expressionAttributeValues[':endDatetime'] = { S: endDatetime };
    }
    if (location) {
      updateFields.push('#location = :location');
      expressionAttributeValues[':location'] = { S: location };
    }
    if (content) {
      updateFields.push('#content = :content');
      expressionAttributeValues[':content'] = { S: content };
    }

    // 이미지가 업로드되었을 때만 photoUrl 업데이트 필드를 추가
    if (imageUrl) {
      updateFields.push('#photoUrl = :photoUrl');
      expressionAttributeValues[':photoUrl'] = { S: imageUrl };
    }

    // UpdateExpression에서 사용되는 표현식을 지정합니다.
    const expressionAttributeNames = {
      '#title': 'Title',
      '#startDatetime': 'StartDatetime',
      '#endDatetime': 'EndDatetime',
      '#location': 'Location',
      '#content': 'Content',
      '#photoUrl': 'PhotoURL', // 표현식에서 사용될 이름을 'PhotoURL'로 변경
    };

    const params = {
      TableName: 'Event',
      Key: {
        'EventId': { S: event_id }
      },
      // 업데이트 할 필드 및 값 정의
      UpdateExpression: 'SET ' + updateFields.join(', '),
      // 필드 이름(Key 값)
      ExpressionAttributeNames: expressionAttributeNames,
      // Value 값
      ExpressionAttributeValues: expressionAttributeValues,
      // 이미지가 있을 때만 업데이트하도록 조건 표현식 추가
      ConditionExpression: 'attribute_not_exists(#photoUrl) OR attribute_exists(#photoUrl)'
    };

    try {
      const command = new UpdateItemCommand(params);
      const response = await dynamodbClient.send(command);

      if (response) {
        // 업데이트 후, "isCompleted" 값을 조회합니다.
        const getParams = {
          TableName: 'Event',
          Key: {
            'EventId': { S: event_id }
          },
          ProjectionExpression: 'Complete', // "Complete" 필드만 가져옵니다.
        };

        const getCommand = new GetItemCommand(getParams);
        const getResponse = await dynamodbClient.send(getCommand);

        // "Complete" 필드가 존재하면 그 값을 읽어옵니다.
        const isCompleted = getResponse.Item && getResponse.Item.Complete && getResponse.Item.Complete.BOOL ? true : false;

        return res.json({ message: "목표가 성공적으로 업데이트되었습니다.", isCompleted });
      } else {
        return res.status(404).json({ detail: "목표를 찾을 수 없음" });
      }
    } catch (error) {
      console.error('An error occurred : ', error);
      return res.status(500).json({ detail: "내부 서버 오류" });
    }
  } catch (error) {
    console.error('An error occurred while processing the update request: ', error);
    return res.status(500).json({ detail: "목표를 업데이트하는 중 오류가 발생했습니다." });
  }
});


module.exports = app; // Express 애플리케이션을 내보내는 부분`