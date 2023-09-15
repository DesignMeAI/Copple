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
  const token = req.cookies.token;
  console.log("Token:", token);

  if (!token) {
    return res.status(401).json({ detail: "인증되지 않았습니다 - 로그인이 필요합니다." });
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded;
    console.log(req.user);
    next();
  } catch (error) {
    console.error("토큰 유효성 검사 오류:", error);
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
      },
    };

    if (imageUrl) { //imageUrl = 이 존재하면 Item 필드에 PhotoURL 추가
      eventParams.Item['PhotoURL'] = { S: imageUrl };
    }

    await dynamodbClient.send(new PutItemCommand(eventParams));//eventParams값 받아서 DynamoDB에 넣는다.

    const goalData = { //goalData에 다 때려밖음, 나중에 Client(Front)에서 데이터 사용할 때 유용함.
      event_id,
      user_id: user.user_id,
      eventType,
      title,
      startDatetime,
      endDatetime,
      location,
      content,
      photoUrl: imageUrl
    };

    res.cookie('goalData', JSON.stringify(goalData));
    return res.status(200).json({
      event_id,
      message: "목표가 성공적으로 생성되었습니다."
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
    // AWS SDK 버전 3에서는 DynamoDBClient와 ScanCommand를 사용하여 요청을 생성합니다.
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
      photoUrl: item.PhotoURL ? item.PhotoURL.S : null
    }));

    return res.json(goals);
  } catch (error) {
    console.error('An error occurred : ', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 한 개의 목표 조회
app.get("/goal/read/:event_id", requireLogin, async (req, res) => {
  const user = req.user;
  const event_id = req.params.event_id;

  const params = {
    TableName: 'Event',
    Key: {
      'EventId': { S: event_id }
    },
  };

  try {
    const command = new GetItemCommand(params);
    const response = await dynamodbClient.send(command);

    if (response.Item) {
      const goalData = {
        event_id: response.Item.EventId.S,
        user_id: response.Item.UserId.S,
        eventType: response.Item.EventType.S,
        title: response.Item.Title.S,
        startDatetime: response.Item.StartDatetime.S,
        endDatetime: response.Item.EndDatetime.S,
        location: response.Item.Location.S,
        content: response.Item.Content.S,
        photoUrl: response.Item.PhotoURL ? response.Item.PhotoURL.S : null
      };
      return res.json(goalData);
    } else {
      return res.status(404).json({ detail: "목표를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error('An error occurred : ', error);
    return res.status(500).json({ detail: "목표를 조회할 수 없습니다." });
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

    // 업데이트 할 필드 목록 초기화
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

    // 조건 표현식을 사용하여 이미지가 있는 경우에만 업데이트하도록 설정
    let updateExpression = '';
    if (updateFields.length > 0) {
      updateExpression = 'SET ' + updateFields.join(', ');
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
      UpdateExpression: updateExpression,
      // 필드 이름(Key 값)
      ExpressionAttributeNames: expressionAttributeNames,
      // Value 값
      ExpressionAttributeValues: expressionAttributeValues,
      // 이미지가 있을 때만 업데이트하도록 조건 표현식 추가
      ConditionExpression: 'attribute_exists(#photoUrl) OR attribute_not_exists(#photoUrl)'
    };

    try {
      const command = new UpdateItemCommand(params);
      const response = await dynamodbClient.send(command);

      if (response) {
        return res.json({ message: "목표가 성공적으로 업데이트되었습니다." });
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


// 8) 목표 삭제
app.delete("/goal/delete/:event_id", requireLogin, async (req, res) => {
  const user = req.user;
  const event_id = req.params.event_id;

  const params = {
    TableName: 'Event',
    Key: {
      'EventId': { S: event_id }
    }
  };

  try {
    const command = new DeleteItemCommand(params); // AWS SDK 버전 3의 DeleteItemCommand를 사용하여 명령(Command) 생성
    const response = await dynamodbClient.send(command); // 명령을 실행하고 응답을 받습니다.

    if (response) {
      return res.json({ message: "목표가 성공적으로 삭제되었습니다." });
    } else {
      return res.status(404).json({ detail: "목표를 찾을 수 없음" });
    }
  } catch (error) {
    console.error('An error occurred : ', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 9) 일정 생성
app.post("/event/create", requireLogin, async (req, res) => {
  const user = req.user;
  const { title, startDatetime, endDatetime, goal, location, content } = req.body;

  const event_id = uuidv4();
  const eventType = 'Event';

  const params = {
    TableName: 'Event',
    Item: {
      'EventId': { S: event_id },
      'UserId': { S: user.user_id },
      'EventType': { S: eventType },
      'Title': { S: title },
      'StartDatetime': { S: startDatetime },
      'EndDatetime': { S: endDatetime },
      'Goal': { S: goal },
      'Location': { S: location },
      'Content': { S: content }
    },
  };

  try {
    await dynamodbClient.send(new PutItemCommand(params));

    const eventData = {
      event_id,
      user_id: user.user_id,
      eventType,
      title,
      startDatetime,
      endDatetime,
      goal,
      location,
      content
    };

    res.cookie("eventData", JSON.stringify(eventData));
    return res.status(200).json({
      event_id,
      message: '일정이 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('An error occurred: ', error);
    return res.status(500).json({ detail: '내부 서버 오류' });
  }
});

// 10) 일정 전체 조회
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

    return res.json(events);
  } catch (error) {
    console.error('오류가 발생했습니다: ', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});

// 11) 일정 하나만 조회
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
      return res.json(eventData);
    } else {
      return res.status(404).json({ detail: "일정을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error('오류가 발생했습니다: ', error);
    return res.status(500).json({ detail: '일정을 조회할 수 없습니다.' })
  }
});

// 12) 일정 수정
app.put("/event/update/:event_id", requireLogin, async (req, res) => {
  const event_id = req.params.event_id;
  const { title, startDatetime, endDatetime, goal, location, content } = req.body;

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

  const params = {
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

  try {
    const updateItemCommand = new UpdateItemCommand(params);
    await dynamodbClient.send(updateItemCommand);

    return res.json({ message: "일정이 성공적으로 업데이트되었습니다." });
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ detail: "내부 서버 오류" });
  }
});


// 13) 일정 삭제
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

// 14) 할 일 생성
app.post("/todo/create", requireLogin, async (req, res) => {
  const user = req.user;
  const { title, goal, location, content } = req.body;

  const event_id = uuidv4();
  const eventType = 'Todo';

  const params = {
    TableName: 'Event',
    Item: {
      'EventId': { S: event_id },
      'UserId': { S: user.user_id },
      'EventType': { S: eventType },
      'Title': { S: title },
      'Goal': { S: goal },
      'Location': { S: location },
      'Content': { S: content }
    },
  };

  try {
    const command = new PutItemCommand(params); // AWS SDK 버전 3의 새로운 방식으로 명령(Command)을 생성합니다.
    await dynamodbClient.send(command); // 명령을 실행합니다.

    const todoData = {
      event_id,
      user_id: user.user_id,
      eventType,
      title,
      goal,
      location,
      content
    };

    res.cookie("todoData", JSON.stringify(todoData));
    return res.status(200).json({
      event_id,
      message: '할 일이 성공적으로 생성되었습니다.'
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

    const todos = response.Items.map(item => ({
      event_id: item.EventId.S,
      user_id: item.UserId.S,
      eventType: item.EventType.S,
      title: item.Title.S,
      goal: item.Goal.S,
      location: item.Location.S,
      content: item.Content.S
    }));

    return res.json(todos);
  } catch (error) {
    console.error('오류가 발생했습니다:', error);
    return res.status(500).json({ detail: '내부 서버 오류' });
  }
});

// 16) 할 일 하나만 조회
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
    const command = new GetItemCommand(params); // AWS SDK 버전 3의 새로운 방식으로 명령(Command)을 생성합니다.
    const response = await dynamodbClient.send(command); // 명령을 실행하고 응답을 받습니다.

    if (response.Item) {
      const todoData = {
        event_id: response.Item.EventId.S,
        user_id: response.Item.UserId.S,
        eventType: response.Item.EventType.S,
        title: response.Item.Title.S,
        goal: response.Item.Goal.S,
        location: response.Item.Location.S,
        content: response.Item.Content.S
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
  const event_id = req.params.event_id;
  const { title, goal, location, content } = req.body;

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

  // 업데이트할 필드가 없으면 에러 메시지 반환
  if (updateFields.length === 0) {
    return res.status(400).json({ detail: "수정할 필드를 지정하세요." });
  }

  // UpdateExpression 생성
  const updateExpression = 'SET ' + updateFields.join(', ');

  const params = {
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
      '#content': 'Content'
    },
    ExpressionAttributeValues: {
      ':title': { S: title },
      ':goal': { S: goal },
      ':location': { S: location },
      ':content': { S: content }
    }
  };

  try {
    const command = new UpdateItemCommand(params); // AWS SDK 버전 3의 새로운 방식으로 명령(Command)을 생성합니다.
    const response = await dynamodbClient.send(command); // 명령을 실행하고 응답을 받습니다.

    if (response) {
      return res.json({ message: "할 일이 성공적으로 업데이트되었습니다." });
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
module.exports = app;