const express = require('express');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const cookieParser = require('cookie-parser');

const path = require('path');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const dynamodb = new AWS.DynamoDB({ region: 'ap-northeast-2' });
const tableName = 'Account';

// 사용자 ID가 이미 존재하는지 확인하는 함수
async function isUserExists(userId) {
    const params = {
        TableName: tableName,
        KeyConditionExpression: 'UserId = :id',
        ExpressionAttributeValues: { ':id': { S: userId } },
    };

    try {
        const response = await dynamodb.query(params).promise();
        return response.Items.length > 0;
    } catch (error) {
        console.error('오류 발생:', error);
        return false;
    }
}

// 사용자 이름이 이미 존재하는지 확인하는 함수
async function isUserNameExists(userName) {
    const params = {
        TableName: tableName,
        FilterExpression: 'UserName = :name',
        ExpressionAttributeValues: { ':name': { S: userName } },
    };

    try {
        const response = await dynamodb.scan(params).promise();
        return response.Items.length > 0;
    } catch (error) {
        console.error('오류 발생:', error);
        return false;
    }
}

// 사용자 ID와 비밀번호가 유효한지 확인하는 함수
async function isValidPassword(userId, userName, password) {
    const params = {
        TableName: tableName,
        Key: {
            'UserId': { S: userId },
            'UserName': { S: userName },
        },
    };

    const response = await dynamodb.getItem(params).promise();
    const item = response.Item;
    return item && item.Password.S === password;
}

// 디버깅: 토큰이 제대로 수신되었는지 확인하는 미들웨어 함수
function requireLogin(req, res, next) {
    const token = req.cookies.token;
    console.log("토큰:", token);

    if (!token) {
        return res.status(401).json({ detail: "인증되지 않았습니다 - 로그인이 필요합니다." });
    }

    try {
        const decoded = jwt.verify(token, 'secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        console.error("토큰 검증 오류:", error);
        return res.status(401).json({ detail: "인증되지 않았습니다 - 잘못된 토큰입니다." });
    }
}

// POST 엔드포인트 "/account/login"
app.post("/account/login", async (req, res) => {
    const { user_id, user_name, password } = req.body;

    if (!password) {
        return res.status(400).json({ detail: "비밀번호를 입력해주세요." });
    }

    try {
        if (await isValidPassword(user_id, user_name, password)) {
            const token = jwt.sign({ user_id, user_name }, 'secret_key', { expiresIn: '1h' });
            res.cookie("token", token);

            return res.json({ message: "로그인 성공" });
        } else {
            return res.status(401).json({ detail: "아이디와 비밀번호를 확인해주세요." });
        }
    } catch (error) {
        console.error('오류 발생:', error);
        return res.status(500).json({ detail: "내부 서버 오류" });
    }
});

// POST 엔드포인트 "/account/logout"
app.post("/account/logout", requireLogin, (req, res) => {
    res.clearCookie("token");
    res.clearCookie("eventData");
    return res.json({ message: "로그아웃 성공" });
});

// POST 엔드포인트 "/account/signup"
app.post("/account/signup", async (req, res) => {
    const { user_id, user_name, password, passwordcheck } = req.body;

    if (await isUserExists(user_id)) {
        return res.status(400).json({ detail: "해당 사용자 ID가 이미 존재합니다." });
    }

    if (await isUserNameExists(user_name)) {
        return res.status(400).json({ detail: "해당 사용자 이름은 이미 사용 중입니다." });
    }

    if (password !== passwordcheck) {
        return res.status(400).json({ detail: "비밀번호가 일치하지 않습니다." });
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
        await dynamodb.putItem(params).promise();
        return res.json({ message: "사용자 등록 완료", user_uuid: user_uuid });
    } catch (error) {
        console.error('오류 발생:', error);
        return res.status(500).json({ detail: "내부 서버 오류" });
    }
});

// GET 엔드포인트 "/account/profile"
app.get("/account/profile", requireLogin, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userName = req.user.user_name;

        // UserId 및 UserName을 기반으로 사용자 프로필 정보 가져오기
        const params = {
            TableName: tableName,
            Key: {
                'UserId': { S: userId },
                'UserName': { S: userName },
            },
        };

        const response = await dynamodb.getItem(params).promise();
        const userProfile = response.Item;

        if (!userProfile) {
            return res.status(404).json({ detail: "프로필을 찾을 수 없습니다." });
        }

        // 민감한 정보 (비밀번호 등) 응답 전에 제거
        delete userProfile.Password;
        delete userProfile.PasswordCheck;

        return res.json({ profile: userProfile });
    } catch (error) {
        console.error('오류 발생:', error);
        return res.status(500).json({ detail: "내부 서버 오류" });
    }
});

// POST 엔드포인트 "/account/find/pw"
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

        const response = await dynamodb.getItem(params).promise();
        const userProfile = response.Item;

        if (!userProfile) {
            return res.status(404).json({ detail: "사용자를 찾을 수 없습니다." });
        }

        // 새로운 임시 비밀번호 생성
        const newTemporaryPassword = generateTemporaryPassword();

        console.log("새로운 임시 비밀번호:", newTemporaryPassword); // 새로운 임시 비밀번호 로깅

        // 사용자의 비밀번호와 PasswordCheck 업데이트
        const updateParams = {
            TableName: tableName,
            Key: {
                'UserId': { S: user_id },
                'UserName': { S: user_name },
            },
            UpdateExpression: 'SET Password = :password, PasswordCheck = :passwordCheck', // PasswordCheck 업데이트
            ExpressionAttributeValues: {
                ':password': { S: newTemporaryPassword },
                ':passwordCheck': { S: newTemporaryPassword }, // PasswordCheck도 새로운 비밀번호로 업데이트
            },
        };

        await dynamodb.updateItem(updateParams).promise();

        return res.json({ message: "새로운 임시 비밀번호가 발급되었습니다.", temporaryPassword: newTemporaryPassword });
    } catch (error) {
        console.error('비밀번호 업데이트 중 오류 발생:', error);
        return res.status(500).json({ detail: "내부 서버 오류" });
    }
});


// POST 엔드포인트 "/account/find/id"
app.post("/account/find/id", async (req, res) => {
    const { user_name } = req.body;

    try {
        const params = {
            TableName: tableName,
            FilterExpression: 'UserName = :name',
            ExpressionAttributeValues: { ':name': { S: user_name } },
        };

        const response = await dynamodb.scan(params).promise();
        const usersWithSameName = response.Items;

        if (usersWithSameName.length === 0) {
            return res.status(404).json({ detail: "해당 이름의 사용자가 없습니다." });
        }

        // 사용자 ID 반환
        const userIDs = usersWithSameName.map(user => user.UserId.S);

        return res.json({ user_ids: userIDs });
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

app.patch("/account/profile/edit", requireLogin, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userName = req.user.user_name;
        const { new_password, new_password_check } = req.body;

        // UserId 및 UserName을 기반으로 사용자 프로필 정보 가져오기
        const params = {
            TableName: tableName,
            Key: {
                'UserId': { S: userId },
                'UserName': { S: userName },
            },
        };

        const response = await dynamodb.getItem(params).promise();
        const userProfile = response.Item;

        if (!userProfile) {
            return res.status(404).json({ detail: "프로필을 찾을 수 없습니다." });
        }

        // 새로운 비밀번호가 일치하는지 확인
        if (new_password !== new_password_check) {
            return res.status(400).json({ detail: "새 비밀번호가 일치하지 않습니다." });
        }

        // 사용자의 비밀번호와 PasswordCheck 업데이트
        const updateParams = {
            TableName: tableName,
            Key: {
                'UserId': { S: userId },
                'UserName': { S: userName },
            },
            UpdateExpression: 'SET Password = :password, PasswordCheck = :passwordCheck', // PasswordCheck 업데이트
            ExpressionAttributeValues: {
                ':password': { S: new_password },
                ':passwordCheck': { S: new_password_check }, // PasswordCheck에 값 제공
            },
        };

        await dynamodb.updateItem(updateParams).promise();

        return res.json({ message: "비밀번호 업데이트가 성공적으로 완료되었습니다." });
    } catch (error) {
        console.error('오류 발생:', error);
        return res.status(500).json({ detail: "내부 서버 오류" });
    }
});

// POST 엔드포인트 "/account/add/photo"
app.post("/account/add/photo", requireLogin, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userName = req.user.user_name;
        const { photo_url } = req.body;

        // 사용자의 프로필을 새로운 사진 URL로 업데이트
        const updateParams = {
            TableName: tableName,
            Key: {
                'UserId': { S: userId },
                'UserName': { S: userName },
            },
            UpdateExpression: 'SET PhotoUrl = :photoUrl',
            ExpressionAttributeValues: {
                ':photoUrl': { S: photo_url },
            },
        };

        await dynamodb.updateItem(updateParams).promise();

        return res.json({ message: "프로필 사진 업로드가 성공적으로 완료되었습니다." });
    } catch (error) {
        console.error('오류 발생:', error);
        return res.status(500).json({ detail: "내부 서버 오류" });
    }
});

// DELETE 엔드포인트 "/account/delete/photo"
app.delete("/account/delete/photo", requireLogin, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userName = req.user.user_name;

        // 사용자 프로필에서 사진 URL 제거
        const updateParams = {
            TableName: tableName,
            Key: {
                'UserId': { S: userId },
                'UserName': { S: userName },
            },
            UpdateExpression: 'REMOVE PhotoUrl',
        };

        await dynamodb.updateItem(updateParams).promise();

        return res.json({ message: "프로필 사진 삭제가 성공적으로 완료되었습니다." });
    } catch (error) {
        console.error('오류 발생:', error);
        return res.status(500).json({ detail: "내부 서버 오류" });
    }
});

module.exports = app; // 애플리케이션 모듈로 내보내기