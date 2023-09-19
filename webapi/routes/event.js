const express = require('express');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { S3Client, PutObjectCommand, DeleteObjectCommand, RestoreObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, PutItemCommand, ScanCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand, BatchGetItemCommand } = require('@aws-sdk/client-dynamodb');
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

// 이미지를 삭제하기 위한 함수
async function deleteImage(imageUrl) {
  try {
    const s3ImageUrl = new URL(imageUrl);
    const key = s3ImageUrl.pathname.slice(1); // 슬래시 제거

    const deleteParams = {
      Bucket: 'seo-3169',
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// 선택한 목표의 정보를 가져오는 함수
async function getGoalById(goalId) {
  try {
    const params = {
      TableName: 'Event', // 목표 정보를 저장하는 테이블 이름
      Key: {
        'EventId': { S: goalId }, // 가져올 목표의 ID
      },
    };
    const goalData = await dynamodbClient.send(new GetItemCommand(params));
    if (!goalData.Item) {
      // 목표를 찾을 수 없을 때 에러 처리
      return null;
    }
    // 목표 정보를 반환
    return {
      event_id: goalData.Item.EventId.S,
      title: goalData.Item.Title.S,
      // 여기에 필요한 다른 목표 정보를 추가할 수 있습니다.
    };
  } catch (error) {
    console.error('목표 정보를 가져오는 중 오류가 발생했습니다:', error);
    throw error; // 오류를 호출한 쪽으로 다시 전파
  }
}

// 1) 목표 생성 upload.single("image") 미들웨어가 사용되고 있으므로, 사용자가 이미지를 업로드하려면 요청에 image라는 필드를 포함해야 합니다. req.file객체에 저장됨.
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
    const isCompleted = false; // 목표 생성 시 기본적으로 "미완료" 상태로 설정
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
        'isCompleted': { BOOL: false }, // "CompletionStatus" 필드를 기반으로 "isCompleted" 필드 설정
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
      isCompleted,
    };
    return res.status(200).json({
      message: "목표가 성공적으로 생성되었습니다.",
      goalData
    });
  } catch (error) {
    console.error('An error occurred while creating the goal with image: ', error);
    return res.status(500).json({ detail: "목표를 생성하는 중 오류가 발생했습니다." });
  }
});

// 2) 목표 전체 조회
app.get("/goal/read", requireLogin, async (req, res) => {
  const user = req.user;
  const eventType = 'Goal';
  const params = {
    TableName: 'Event',
    FilterExpression: 'UserId = :userId AND EventType = :eventType',
    ExpressionAttributeValues: {
      ':userId': { S: user.user_id },
      ':eventType': { S: eventType },
    },
  };
  try {
    const command = new ScanCommand(params);
    const response = await dynamodbClient.send(command);
    // 업데이트된 값을 가져오기 위해 업데이트된 event_id 목록을 생성
    const updatedEventIds = response.Items.map(item => item.EventId.S);
    // 업데이트된 데이터를 가져오기 위해 BatchGetItem을 사용
    const batchGetParams = {
      RequestItems: {
        'Event': {
          Keys: updatedEventIds.map(event_id => ({
            'EventId': { S: event_id }
          }))
        }
      }
    };
    const batchGetCommand = new BatchGetItemCommand(batchGetParams);
    const batchGetResponse = await dynamodbClient.send(batchGetCommand);
    const goals = batchGetResponse.Responses['Event'].map(item => ({
      event_id: item.EventId.S,
      user_id: item.UserId.S,
      eventType: item.EventType.S,
      title: item.Title.S,
      startDatetime: item.StartDatetime.S,
      endDatetime: item.EndDatetime.S,
      location: item.Location.S,
      content: item.Content.S,
      photoUrl: item.PhotoURL ? item.PhotoURL.S : null,
      isCompleted: item.isCompleted ? item.isCompleted.BOOL : false
    }));
    return res.status(200).json(goals);
  } catch (error) {
    console.error('An error occurred while fetching goals: ', error);
    return res.status(500).json({ detail: "목표 목록을 불러오는 중 오류가 발생했습니다." });
  }
});

// 3) 목표 하나만 조회
app.get("/goal/read/:event_id", requireLogin, async (req, res) => {
  const user = req.user;
  const event_id = req.params.event_id; // 클라이언트에서 전달한 event_id
  const { title, start_datetime, end_datetime, location, content, is_completed } = req.body;

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
      isCompleted: response.Item.isCompleted ? response.Item.isCompleted.BOOL : false
    };

    return res.json(goal);
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ detail: '내부 서버 오류' });
  }
});

// 4) 목표 수정
app.put("/goal/update/:event_id", requireLogin, upload.single("image"), async (req, res) => {
  const user = req.user; // 사용자 정보 가져오기
  const event_id = req.params.event_id; // 업데이트할 목표의 event_id 가져오기
  const { title, startDatetime, endDatetime, location, content, isCompleted } = req.body; // 요청에서 데이터 추출
  try {
    let imageUrl = null;
    // 새로운 이미지가 업로드되었는지 확인
    if (req.file) {
      const fileBuffer = req.file.buffer; // 업로드된 파일 버퍼 가져오기
      const fileType = req.file.mimetype; // 파일 유형 가져오기
      const userId = user.user_id;
      const key = `travel_photos/${uuidv4()}.jpg`; // 이미지를 저장할 S3 버킷 키 생성
      // S3에 이미지 업로드
      const params = {
        Bucket: 'seo-3169', // S3 버킷 이름
        Key: key, // 이미지를 저장할 키
        Body: fileBuffer, // 이미지 파일 버퍼
        ContentType: fileType, // 이미지 파일 유형
      };
      await s3Client.send(new PutObjectCommand(params)); // 이미지를 S3에 업로드
      // 업로드된 이미지의 URL 생성
      imageUrl = `https://${params.Bucket}.s3.ap-northeast-2.amazonaws.com/${params.Key}`;
    }
    // DynamoDB에서 해당 event_id를 가진 목표 정보를 조회
    const getItemParams = {
      TableName: 'Event', // DynamoDB 테이블 이름
      Key: {
        'EventId': { S: event_id }, // 조회할 목표의 event_id
      },
    };
    const getItemCommand = new GetItemCommand(getItemParams);
    const getItemResponse = await dynamodbClient.send(getItemCommand);

    if (!getItemResponse.Item) {
      // 해당 event_id를 가진 목표가 없으면 404 응답 반환
      return res.status(404).json({ detail: '해당 목표를 찾을 수 없습니다.' });
    }
    const existingItem = getItemResponse.Item;
    // 기존 이미지 URL이 있고, 새 이미지가 업로드되었으면 이전 이미지 삭제
    if (existingItem.PhotoURL && imageUrl) {
      await deleteImage(existingItem.PhotoURL.S);
    }
    // 나머지 데이터와 함께 DynamoDB를 업데이트
    const updateParams = {
      TableName: 'Event',
      Key: {
        'EventId': { S: event_id }, // 업데이트할 목표의 event_id
      },
      UpdateExpression: 'SET #title=:title, #startDatetime=:startDatetime, #endDatetime=:endDatetime, #location=:location, #content=:content, #isCompleted=:isCompleted',
      ExpressionAttributeNames: {
        '#title': 'Title',
        '#startDatetime': 'StartDatetime',
        '#endDatetime': 'EndDatetime',
        '#location': 'Location',
        '#content': 'Content',
        '#photoURL': 'PhotoURL',
        '#isCompleted': 'isCompleted',
      },
      ExpressionAttributeValues: {
        ':title': { S: title },
        ':startDatetime': { S: startDatetime },
        ':endDatetime': { S: endDatetime },
        ':location': { S: location },
        ':content': { S: content },
        ':isCompleted': { BOOL: isCompleted !== undefined ? isCompleted : false }, // isCompleted 값을 DynamoDB BOOL 형식으로 설정
      }
    };
    if (imageUrl) {
      updateParams.UpdateExpression += ', #photoURL = :photoURL';
      updateParams.ExpressionAttributeValues[':photoURL'] = { S: imageUrl };
    } else {
      // 이미지가 없는 경우 PhotoURL 속성을 삭제
      updateParams.UpdateExpression += ' REMOVE #photoURL';
    }
    // DynamoDB 업데이트 수행
    await dynamodbClient.send(new UpdateItemCommand(updateParams));
    // 수정된 목표 정보 생성
    const updatedGoal = {
      event_id,
      user_id: user.user_id,
      eventType: existingItem.EventType.S,
      title,
      startDatetime,
      endDatetime,
      location,
      content,
      photoUrl: imageUrl || null,
      isCompleted, // 수정된 값 사용
    };
    // 성공적인 응답 반환
    return res.status(200).json({
      message: "목표가 성공적으로 수정 되었습니다.",
      updatedGoal
    });
  } catch (error) {
    console.error('An error occurred while updating the goal:', error);
    return res.status(500).json({ detail: "목표를 수정하는 중 오류가 발생했습니다." });
  }
});

// 5) 목표 삭제
app.delete("/goal/delete/:event_id", requireLogin, async (req, res) => {
  const user = req.user;
  const event_id = req.params.event_id;
  try {
    const params = {
      TableName: 'Event',
      Key: {
        'EventId': { S: event_id }
      },
    };
    const command = new DeleteItemCommand(params);
    await dynamodbClient.send(command);
    return res.status(200).json({ message: "목표가 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error('An error occurred while deleting the goal: ', error);
    return res.status(500).json({ detail: "목표를 삭제하는 중 오류가 발생했습니다." });
  }
});

// 6) 날짜에 해당하는 목표 정보 조회
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
      isCompleted: item.Completed ? item.Completed.BOOL : false // "Complete" 필드를 기반으로 "isCompleted" 값을 설정
    }));
    // 클라이언트에게 목표 목록을 반환합니다.
    return res.json(goals);
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ detail: '내부 서버 오류' });
  }
});

// 7) 목표 완료 조회(true: success, false: still in progress)
app.get("/goal/isCompleted/:event_id", requireLogin, async (req, res) => {
  const event_id = req.params.event_id;
  try {
    // 해당 목표의 현재 상태를 조회합니다.
    const getParams = {
      TableName: 'Event',
      Key: {
        'EventId': { S: event_id }
      },
      ProjectionExpression: 'isCompleted' // "isCompleted" 필드만 조회합니다.
    };
    const getCommand = new GetItemCommand(getParams);
    const getResponse = await dynamodbClient.send(getCommand);
    let isCompleted = false; // 목표의 완료 상태를 나타내는 변수
    if (getResponse && getResponse.Item && getResponse.Item.isCompleted) {
      isCompleted = getResponse.Item.isCompleted.BOOL;
    }
    const resultMessage = isCompleted ? "success" : "still in progress";
    return res.json({ result: resultMessage });
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 8) 일정 생성
app.post("/event/create", requireLogin, async (req, res) => {
  const user = req.user;
  const { title, startDatetime, endDatetime, goal, location, content } = req.body;
  const event_id = uuidv4();
  const eventType = 'Event';
  try {
    // 선택한 목표의 정보를 가져오기
    const selectedGoal = await getGoalById(goal);
    if (!selectedGoal) {
      return res.status(400).json({ detail: '지정된 목표를 찾을 수 없습니다.' });
    }
    // 일정 데이터를 DynamoDB에 저장하기 위한 파라미터 설정
    const params = {
      TableName: 'Event',
      Item: {
        'EventId': { S: event_id },
        'UserId': { S: user.user_id },
        'EventType': { S: eventType },
        'Title': { S: title },
        'StartDatetime': { S: startDatetime },
        'EndDatetime': { S: endDatetime },
        'Goal': { S: goal }, // 목표의 EventId를 사용
        'Location': { S: location },
        'Content': { S: content }
      },
    };
    const command = (new PutItemCommand(params));
    await dynamodbClient.send(command);
    // 응답 데이터 구성
    const eventData = {
      event_id,
      user_id: user.user_id,
      eventType,
      title,
      startDatetime,
      endDatetime,
      goal: selectedGoal.title, // 선택한 목표의 제목 사용
      location,
      content
    };
    // 클라이언트에 응답
    return res.status(200).json({
      message: '일정이 성공적으로 생성되었습니다.',
      eventData
    });
  } catch (error) {
    console.error('오류가 발생했습니다:', error);
    return res.status(500).json({ detail: '내부 서버 오류' });
  }
});

// 9) 일정 전체 조회
app.get("/event/read", requireLogin, async (req, res) => {
  const user = req.user;
  const eventType = 'Event';
  const params = {
    TableName: 'Event',
    FilterExpression: 'UserId = :userId AND EventType = :eventType',
    ExpressionAttributeValues: {
      ':userId': { S: user.user_id },
      ':eventType': { S: eventType },
    }
  };
  try {
    const command = new ScanCommand(params); // AWS SDK 버전 3의 새로운 방식으로 명령(Command)을 생성합니다.
    const response = await dynamodbClient.send(command); // 명령을 실행하고 응답을 받습니다.
    const events = response.Items.map(item => ({
      event_id: item.EventId.S,
      user_id: item.UserId.S,
      eventType: item.EventType.S,
      title: item.Title.S,
      startDatetime: item.StartDatetime.S,
      endDatetime: item.EndDatetime.S,
      goal: item.Goal.S,
      location: item.Location.S,
      content: item.Content.S
    }));
    return res.status(200).json(events);
  } catch (error) {
    console.error('오류가 발생했습니다: ', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 10) 일정 하나만 조회
app.get("/event/read/:event_id", requireLogin, async (req, res) => {
  const user = req.user;
  const event_id = req.params.event_id;
  const params = {
    TableName: 'Event',
    Key: {
      'EventId': { S: event_id }
    }
  };
  try {
    const command = new GetItemCommand(params); // AWS SDK 버전 3의 새로운 방식으로 명령(Command)을 생성합니다.
    const response = await dynamodbClient.send(command); // 명령을 실행하고 응답을 받습니다.
    if (response.Item) {
      const eventData = {
        event_id: response.Item.EventId.S,
        user_id: response.Item.UserId.S,
        eventType: response.Item.EventType.S,
        title: response.Item.Title.S,
        startDatetime: response.Item.StartDatetime.S,
        endDatetime: response.Item.EndDatetime.S,
        goal: response.Item.Goal.S,
        location: response.Item.Location.S,
        content: response.Item.Content.S
      };
      return res.status(200).json(eventData);
    } else {
      return res.status(404).json({ detail: "일정을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error('오류가 발생했습니다: ', error);
    return res.status(500).json({ detail: '일정을 조회할 수 없습니다.' })
  }
});

// 11) 일정 수정
app.put("/event/update/:event_id", requireLogin, async (req, res) => {
  const user = req.user; // 사용자 정보 가져오기
  const event_id = req.params.event_id;
  const { title, startDatetime, endDatetime, goal, location, content } = req.body;
  try {
    // DynamoDB에서 해당 event_id를 가진 목표 정보를 조회
    const getItemParams = {
      TableName: 'Event',
      Key: {
        'EventId': { S: event_id }, // 조회할 목표의 event_id
      },
    };
    const getItemCommand = new GetItemCommand(getItemParams);
    const getItemResponse = await dynamodbClient.send(getItemCommand);
    if (!getItemResponse.Item) {
      // 해당 event_id를 가진 목표가 없으면 404 응답 반환
      return res.status(404).json({ detail: '해당 목표를 찾을 수 없습니다.' });
    }
    // 기존 목표 정보 가져오기
    const existingItem = getItemResponse.Item;
    // 업데이트할 필드 목록 초기화
    const updateFields = [];
    // 필드가 주어진 경우에만 해당 필드를 업데이트 목록에 추가
    if (title) {
      updateFields.push('#title = :title');
    }
    if (startDatetime) {
      updateFields.push('#startDatetime = :startDatetime');
    }
    if (endDatetime) {
      updateFields.push('#endDatetime = :endDatetime');
    }
    if (goal) {
      updateFields.push('#goal = :goal');
    }
    if (location) {
      updateFields.push('#location = :location');
    }
    if (content) {
      updateFields.push('#content = :content');
    }
    // 업데이트할 필드가 없으면 에러 메시지 반환
    if (updateFields.length === 0) {
      return res.status(400).json({ detail: "수정할 필드를 지정하세요." });
    }
    // UpdateExpression 생성
    const updateExpression = 'SET ' + updateFields.join(', ');
    const updateParams = {
      TableName: 'Event',
      Key: {
        'EventId': { S: event_id }
      },
      // 업데이트 할 필드 및 값 정의
      UpdateExpression: updateExpression,
      // 필드 이름(Key 값)
      ExpressionAttributeNames: {
        '#title': 'Title',
        '#startDatetime': 'StartDatetime',
        '#endDatetime': 'EndDatetime',
        '#goal': 'Goal',
        '#location': 'Location',
        '#content': 'Content'
      },
      ExpressionAttributeValues: {
        ':title': { S: title },
        ':startDatetime': { S: startDatetime },
        ':endDatetime': { S: endDatetime },
        ':goal': { S: goal },
        ':location': { S: location },
        ':content': { S: content }
      }
    };
    await dynamodbClient.send(new UpdateItemCommand(updateParams));
    const updatedEvent = {
      event_id,
      user_id: user.user_id,
      eventType: existingItem.EventType.S,
      title,
      startDatetime,
      endDatetime,
      goal,
      location,
      content,
    };
    return res.status(200).json({
      message: "일정이 성공적으로 업데이트되었습니다.",
      updatedEvent
    });
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 12) 일정 삭제
app.delete("/event/delete/:event_id", requireLogin, async (req, res) => {
  const event_id = req.params.event_id;
  const params = {
    TableName: 'Event',
    Key: {
      'EventId': { S: event_id }
    }
  };
  try {
    const command = new DeleteItemCommand(params); // AWS SDK 버전 3의 새로운 방식으로 명령(Command)을 생성합니다.
    const response = await dynamodbClient.send(command); // 명령을 실행하고 응답을 받습니다.
    if (response) {
      return res.json({ message: "일정이 성공적으로 삭제되었습니다." });
    } else {
      return res.status(404).json({ detail: "일정을 찾을 수 없음" });
    }
  } catch (error) {
    console.error('오류가 발생했습니다:', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 13) 날짜에 해당하는 일정 정보 조회
app.get("/event/readByDate/:date", requireLogin, async (req, res) => {
  const user = req.user;
  const date = req.params.date; // 클라이언트에서 전달된 날짜
  // 날짜 범위를 설정합니다. 여기서는 날짜 범위를 해당 날짜의 00:00:00부터 23:59:59까지로 가정합니다.
  const params = {
    TableName: 'Event',
    FilterExpression: 'UserId = :userId AND EventType = :eventType AND StartDatetime <= :date AND EndDatetime >= :date',
    ExpressionAttributeValues: {
      ':userId': { S: user.user_id },
      ':eventType': { S: 'Event' },
      ':date': { S: date },
    }
  };
  try {
    const command = new ScanCommand(params);
    const response = await dynamodbClient.send(command);
    const events = response.Items.map(item => ({
      event_id: item.EventId.S,
      user_id: item.UserId.S,
      eventType: item.EventType.S,
      title: item.Title.S,
      startDatetime: item.StartDatetime.S,
      endDatetime: item.EndDatetime.S,
      goal: item.Goal.S,
      location: item.Location.S,
      content: item.Content.S
    }));
    return res.json(events);
  } catch (error) {
    console.error('오류가 발생했습니다: ', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 14) 할 일 생성
app.post("/todo/create", requireLogin, async (req, res) => {
  const user = req.user;
  const { title, goal, location, content, isCompleted } = req.body; // 'goal' 필드에서 목표의 EventId를 가져옴
  const event_id = uuidv4();
  const eventType = 'Todo';
  try {
    // 선택한 목표의 정보를 가져오기
    const selectedGoal = await getGoalById(goal);
    if (!selectedGoal) {
      return res.status(400).json({ detail: '지정된 목표를 찾을 수 없습니다.' });
    }
    // 할 일 데이터를 DynamoDB에 저장하기 위한 파라미터 설정
    const params = {
      TableName: 'Event',
      Item: {
        'EventId': { S: event_id },
        'UserId': { S: user.user_id },
        'EventType': { S: eventType },
        'Title': { S: title },
        'Goal': { S: goal }, // 목표의 EventId를 사용
        'Location': { S: location },
        'Content': { S: content },
        'isCompleted': { BOOL: isCompleted } // 완료 상태를 기본값으로 추가
      },
    };
    const command = new PutItemCommand(params);
    await dynamodbClient.send(command);
    // 응답 데이터 구성
    const todoData = {
      event_id,
      user_id: user.user_id,
      eventType,
      title,
      goal: selectedGoal.title, // 선택한 목표의 제목 사용
      location,
      content,
      isCompleted
    };
    // 클라이언트에 응답
    return res.status(200).json({
      message: '할 일이 성공적으로 생성되었습니다.',
      todoData
    });
  } catch (error) {
    console.error('오류가 발생했습니다:', error);
    return res.status(500).json({ detail: '내부 서버 오류' });
  }
});

// 15) 할 일 전체 조회
app.get("/todo/read", requireLogin, async (req, res) => {
  const user = req.user;
  const eventType = 'Todo';
  const params = {
    TableName: 'Event',
    FilterExpression: 'UserId = :userId and EventType = :eventType',
    ExpressionAttributeValues: {
      ':userId': { S: user.user_id },
      ':eventType': { S: eventType },
    }
  };
  try {
    const command = new ScanCommand(params); // AWS SDK 버전 3의 새로운 방식으로 명령(Command)을 생성합니다.
    const response = await dynamodbClient.send(command); // 명령을 실행하고 응답을 받습니다.
    // 업데이트된 값을 가져오기 위해 업데이트된 event_id 목록을 생성
    const updatedEventIds = response.Items.map(item => item.EventId.S);
    // 업데이트된 데이터를 가져오기 위해 BatchGetItem을 사용
    const batchGetParams = {
      RequestItems: {
        'Event': {
          Keys: updatedEventIds.map(event_id => ({
            'EventId': { S: event_id }
          }))
        }
      }
    };
    const batchGetCommand = new BatchGetItemCommand(batchGetParams);
    const batchGetResponse = await dynamodbClient.send(batchGetCommand);
    const todos = batchGetResponse.Responses['Event'].map(item => ({
      event_id: item.EventId.S,
      user_id: item.UserId.S,
      eventType: item.EventType.S,
      title: item.Title.S,
      goal: item.Goal.S,
      location: item.Location.S,
      content: item.Content.S,
      isCompleted: item.isCompleted ? item.isCompleted.BOOL : false // 완료 상태를 응답에 추가
    }));
    return res.status(200).json(todos);
  } catch (error) {
    console.error('오류가 발생했습니다:', error);
    return res.status(500).json({ detail: '내부 서버 오류' });
  }
});

// 16)할 일 하나만 조회
app.get("/todo/read/:event_id", requireLogin, async (req, res) => {
  const user = req.user;
  const event_id = req.params.event_id;
  const params = {
    TableName: 'Event',
    Key: {
      'EventId': { S: event_id }
    }
  };
  try {
    const command = new GetItemCommand(params);
    const response = await dynamodbClient.send(command);
    if (response.Item) {
      const todoData = {
        event_id: response.Item.EventId.S,
        user_id: response.Item.UserId.S,
        eventType: response.Item.EventType.S,
        title: response.Item.Title.S,
        goal: response.Item.Goal.S,
        location: response.Item.Location.S,
        content: response.Item.Content.S,
        isCompleted: response.Item.isCompleted ? response.Item.isCompleted.BOOL : false // 완료 상태를 응답에 추가
      };
      return res.json(todoData);
    } else {
      return res.status(404).json({ detail: "할 일을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error('오류가 발생했습니다:', error);
    return res.status(500).json({ detail: '할 일을 조회할 수 없습니다.' });
  }
});

// 17) 할 일 수정
app.put("/todo/update/:event_id", requireLogin, async (req, res) => {
  const user = req.user;
  const event_id = req.params.event_id;
  const { title, goal, location, content, isCompleted } = req.body; // 클라이언트에서 isComplete 값을 받음
  // 업데이트할 필드 목록 초기화
  const updateFields = [];
  // 필드가 주어진 경우에만 해당 필드를 업데이트 목록에 추가
  if (title) {
    updateFields.push('#title = :title');
  }
  if (goal) {
    updateFields.push('#goal = :goal');
  }
  if (location) {
    updateFields.push('#location = :location');
  }
  if (content) {
    updateFields.push('#content = :content');
  }
  if (isCompleted !== undefined) { // isComplete 값이 주어진 경우에만 업데이트 목록에 추가
    updateFields.push('#isCompleted = :isCompleted'); // 수정된 부분: #isCompleted를 사용하도록 변경
  }
  // 업데이트할 필드가 없으면 에러 메시지 반환
  if (updateFields.length === 0) {
    return res.status(400).json({ detail: "수정할 필드를 지정하세요." });
  }
  // UpdateExpression 생성
  const updateExpression = 'SET ' + updateFields.join(', ');
  // 이전 데이터를 가져오는 부분
  const getPreviousDataParams = {
    TableName: 'Event',
    Key: {
      'EventId': { S: event_id }
    }
  };
  try {
    const getPreviousDataCommand = new GetItemCommand(getPreviousDataParams);
    const getPreviousDataResponse = await dynamodbClient.send(getPreviousDataCommand);
    if (!getPreviousDataResponse.Item) {
      return res.status(404).json({ detail: "할 일을 찾을 수 없음" });
    }
    const existingItem = getPreviousDataResponse.Item;
    const updateParams = {
      TableName: 'Event',
      Key: {
        'EventId': { S: event_id }
      },
      // 업데이트할 필드 및 값 정의
      UpdateExpression: updateExpression,
      // 필드 이름(Key 값)
      ExpressionAttributeNames: {
        '#title': 'Title',
        '#goal': 'Goal',
        '#location': 'Location',
        '#content': 'Content',
        '#isCompleted': 'isCompleted' // 수정된 부분: #isCompleted를 사용하도록 변경
      },
      ExpressionAttributeValues: {
        ':title': { S: title },
        ':goal': { S: goal },
        ':location': { S: location },
        ':content': { S: content },
        ':isCompleted': { BOOL: isCompleted !== undefined ? isCompleted : false } // 클라이언트에서 받은 값 또는 기본값
      }
    };
    const updateItemCommand = new UpdateItemCommand(updateParams);
    const response = await dynamodbClient.send(updateItemCommand);
    const updatedEventData = {
      event_id,
      user_id: user.user_id,
      eventType: existingItem.EventType.S,
      title,
      goal,
      location,
      content,
      isCompleted,
    };
    if (response) {
      return res.status(200).json({
        message: "할 일이 성공적으로 업데이트되었습니다.",
        updatedEvent: updatedEventData
      });
    } else {
      return res.status(404).json({ detail: "할 일을 찾을 수 없음" });
    }
  } catch (error) {
    console.error('오류가 발생했습니다:', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 18) 할 일 삭제
app.delete("/todo/delete/:event_id", requireLogin, async (req, res) => {
  const user = req.user;
  const event_id = req.params.event_id;
  const params = {
    TableName: 'Event',
    Key: {
      'EventId': { S: event_id }
    }
  };
  try {
    const command = new DeleteItemCommand(params); // AWS SDK 버전 3의 새로운 방식으로 명령(Command)을 생성합니다.
    const response = await dynamodbClient.send(command); // 명령을 실행하고 응답을 받습니다.
    if (response) {
      return res.json({ message: "할 일이 성공적으로 삭제되었습니다." });
    } else {
      return res.status(404).json({ detail: "할 일을 찾을 수 없음" });
    }
  } catch (error) {
    console.error('오류가 발생했습니다:', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 19) 할 일 완료(ture: success, false: still in progress)
app.get("/todo/complete/:event_id", requireLogin, async (req, res) => {
  const event_id = req.params.event_id;
  try {
    // 해당 할 일의 현재 상태를 조회합니다.
    const getParams = {
      TableName: 'Event', // 'Todo'에서 'Event'로 수정
      Key: {
        'EventId': { S: event_id }
      },
      ProjectionExpression: 'isCompleted'
    };
    const getCommand = new GetItemCommand(getParams);
    const getResponse = await dynamodbClient.send(getCommand);
    let isCompleted = false; // 할 일의 완료 상태를 나타내는 변수
    if (getResponse && getResponse.Item && getResponse.Item.isCompleted) {
      isCompleted = getResponse.Item.isCompleted.BOOL;
    }
    const resultMessage = isCompleted ? "success" : "still in progress";
    return res.json({ result: resultMessage });
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

module.exports = app; // Express 애플리케이션을 내보내는 부분