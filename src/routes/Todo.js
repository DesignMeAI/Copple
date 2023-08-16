import styled from "styled-components";
import { useEffect, useState } from "react";
import axios from "axios";
import List from "../components/todoItem";
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  gap: 15px;
`;

function Todo() {
    const [content, setContent] = useState("")
    const [todos, setTodos] = useState([]);
    useEffect(() => {
        axios({
            method: 'get',
            url: 'https://www.pre-onboarding-selection-task.shop/todos',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("access_key")}`
            }
        }).then(function (response) {
            const data = response.data;
            setTodos(data.map(data => {
                return {
                    'text': data.todo,
                    'id': data.id,
                    'isCompleted': data.isCompleted
                }
            }))
        }).catch(error => { console.log('error : ', error.response) });
    }, [])

    function paintToDo(todos) {
        setTodos(todos);
    }
    function saveToDos(content) {
        const TODOS_KEY = `todos${localStorage.length}`;
        localStorage.setItem(TODOS_KEY, content);
    }

    function handleToDoSubmit(event) {
        event.preventDefault();
        const newTodo = content;
        setContent("")
        axios({
            method: 'post',
            url: 'https://www.pre-onboarding-selection-task.shop/todos',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("access_key")}`
            },
            data: {
                todo: newTodo
            }
        })
            .then(function (response) {
                const data = response.data;
                const newTodoObj = {
                    text: newTodo,
                    id: data.id,
                    isCompleted: data.isCompleted
                }
                const updatedTodos = [...todos, newTodoObj];
                paintToDo(updatedTodos);
                saveToDos(newTodo);

            })
            .catch(error => { console.log('error : ', error.response) });
    }
    function onChange(event) {
        setContent(event.target.value)
    }
    return (<Container>
        <form id="todo-form" onSubmit={handleToDoSubmit}>
            <input data-testid="new-todo-input" onChange={onChange} value={content} required />
            <button data-testid="new-todo-add-button">추가</button>
        </form>
        <div id="todo-list">
            {todos.map((todo) => (
                <List key={todo.id} id={todo.id} text={todo.text} />
            ))}
        </div>

    </Container>)
}

export default Todo;