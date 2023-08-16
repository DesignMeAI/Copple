import axios from "axios";
import styled from "styled-components";
import { useState } from "react";
const Secret = styled.span``;
const Original = styled.span``;

function List({ id, text }) {
    const [content, setContent] = useState("")
    const [check, setCheck] = useState(false)
    let [display, setDisplay] = useState('flex')
    let [display2, setDisplay2] = useState('none')

    function deleteHandler(event) {
        const li = event.target.parentElement;
        const ul = li.parentElement;
        li.remove();
        ul.remove();
        axios({
            method: 'delete',
            url: `https://www.pre-onboarding-selection-task.shop/todos/${id}`,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("access_key")}`
            }
        }).then(function (response) {
            const data = response;
            console.log(data)
        }).catch(error => { console.log('error : ', error.response) });
    };

    function amendHandler() {
        const changedData = content
        axios({
            method: 'put',
            url: `https://www.pre-onboarding-selection-task.shop/todos/${id}`,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("access_key")}`,
                'Content-Type': 'application/json'
            },
            data: {
                todo: changedData,
                isCompleted: check
            }
        }).then(function (response) {
            const data = response;
            console.log(data)
        }).catch(error => { console.log('error : ', error.response) });
        setContent("")
        return
    }
    function showHandler() {
        setDisplay('none');
        setDisplay2('block')

    }
    function cancelHandler() {
        setDisplay('block');
        setDisplay2('none')

    }
    function onChange(event) {
        setContent(event.target.value)
    }
    function checkHandler() {
        setCheck(!check)
    }
    return (
        <ul >
            <li data-id={id}>
                <Secret style={{ display: `${display2}` }}>
                    <input id='complete' type="checkbox" onClick={checkHandler} checked={check} />
                    <input data-testid="modify-input" type="text" value={content} onChange={onChange} required />
                    <button data-testid="submit-button" onClick={amendHandler}>제출</button>
                    <button data-testid="cancel-button" onClick={cancelHandler}>취소</button>
                </Secret>
                <Original style={{ display: `${display}` }}>
                    <label>
                        <input id='complete' type="checkbox" onClick={checkHandler} checked={check} />
                        <span >{text}</span>
                    </label>
                    <button data-testid="modify-button" onClick={showHandler}>수정</button>
                    <button data-testid="delete-button" onClick={deleteHandler}>삭제</button></Original>
            </li></ul>
    )
}

export default List;