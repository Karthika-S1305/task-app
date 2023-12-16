import { useContext, useEffect, useState } from "react";
import UserContext from "./UserContext";
import axios from "axios";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

function Home() {
  const userInfo = useContext(UserContext);
  const [inputVal, setInputVal] = useState("");
  const [todos, setTodos] = useState([]);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editedText, setEditedText] = useState(""); // New state to hold the edited text

  useEffect(() => {
    if (userInfo.email) {
      axios
        .get("http://localhost:4000/todos", { withCredentials: true })
        .then((response) => {
          setTodos(response.data);
        })
        .catch((error) => {
          console.error("Error fetching todos:", error);
        });
    }
  }, [userInfo.email]);

  if (!userInfo.email) {
    return "Welcome to the To-Do List app! Start managing your tasks";
  }

  function addTodo(e) {
    e.preventDefault();

    axios
      .put(
        "http://localhost:4000/todos",
        { text: inputVal },
        { withCredentials: true }
      )
      .then((response) => {
        setTodos([...todos, response.data]);
        setInputVal("");
      })
      .catch((error) => {
        console.error("Error adding todo:", error);
      });
  }

  function deleteTodo(todo) {
    axios
      .delete(`http://localhost:4000/todos/${todo._id}`, {
        withCredentials: true,
      })
      .then(() => {
        const updatedTodos = todos.filter((t) => t._id !== todo._id);
        setTodos(updatedTodos);
      })
      .catch((error) => {
        console.error("Error in deleting task:", error);
      });
  }

  function updateTodo(todo) {
    const data = { id: todo._id, done: !todo.done };
    axios
      .post("http://localhost:4000/todos", data, { withCredentials: true })
      .then(() => {
        const newTodos = todos.map((t) => {
          if (t._id === todo._id) {
            t.done = !t.done;
          }
          return t;
        });
        setTodos([...newTodos]);
      })
      .catch((error) => {
        console.log("Error in updating Task", error);
      });
  }

  function startEditing(todoId, initialText) {
    setEditingTodoId(todoId);
    setEditedText(initialText); // Set the initial text when editing starts
  }

  function finishEditing(todoId) {
    // Make a PUT request to update the todo text on the server
    axios
      .put(
        `http://localhost:4000/todos/${todoId}`,
        { text: editedText },
        { withCredentials: true }
      )
      .then(() => {
        // Update the client-side state (todos) with the edited todo
        const updatedTodos = todos.map((t) => {
          if (t._id === todoId) {
            t.text = editedText;
          }
          return t;
        });
        setTodos(updatedTodos);
        setEditingTodoId(null); // Reset editing state
        setEditedText(""); // Reset the edited text state
      })
      .catch((error) => {
        console.error("Error updating todo:", error);
      });
  }

  return (
    <div>
    <p>Todo List</p>
      <form>
        <div className="add-task">
          <input
            placeholder={"Enter Task..."}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button
            disabled={!inputVal.trim()} // Disable the button if inputVal is empty or contains only whitespace
            className={`add-button ${!inputVal.trim() ? "disabled" : ""}`}
            onClick={addTodo}
          >
            Add
          </button>
        </div>
      </form>
      <ul>
        {todos.map((todo) => (
          <li className="task-item" key={todo._id}>
            <div className="task-box">
              {editingTodoId === todo._id ? (
                // Display input field for editing
                <>
                  <input
                  style={{width:'170px', height:'23px'}}
                    type="text"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                  <button style={{height:'28px'}} onClick={() => finishEditing(todo._id)}>Save</button>
                </>
              ) : (
                // Display todo item
                <>
                  <input
                    type={"checkbox"}
                    checked={todo.done}
                    onChange={() => updateTodo(todo)}
                  />
                  <span className="task-text">{todo.text}</span>
                  <div className="task-buttons">
                    <FaEdit onClick={() => startEditing(todo._id, todo.text)} />
                    <FaTrashAlt onClick={() => deleteTodo(todo)} />
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
