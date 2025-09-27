import { useState, useEffect } from "react";
import Blog from "./components/Blog";
import blogService from "./services/blogs";
import loginService from "./services/login";
import Notification from "./components/Notification";

const baseBlogState = {
  title: "",
  url: "",
  author: "",
};
const localStorageKey = "loggedNoteappUser";

const App = () => {
  const baseNotification = {
    message: null,
    variant: "error",
  };

  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(baseNotification);

  const [blog, setBlog] = useState(baseBlogState);

  const showNotification = (data) => {
    setNotification({ ...notification, ...data });
    setTimeout(() => setNotification(baseNotification), 5000);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const user = await loginService.login({ username, password });
      setUser(user);
      blogService.setToken(user.token);
      localStorage.setItem(localStorageKey, JSON.stringify(user));
      setUsername("");
      setPassword("");
    } catch {
      showNotification({ message: "wrong credentials" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(localStorageKey);
    setUser(null);
  };

  const handleBlogChange = (e) => {
    setBlog({
      ...blog,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddBlog = (event) => {
    event.preventDefault();

    blogService
      .create(blog)
      .then((returnedBlog) => {
        setBlogs(blogs.concat(returnedBlog));
        setBlog(baseBlogState);
      })
      .catch((err) => {
        const message = err?.response?.data?.error;
        showNotification({ message });
        console.log(err);
      });
  };

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem(localStorageKey);
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <h2>Login to application</h2>
      <div>
        <label>
          username
          <input
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  );

  const blogForm = () => (
    <form onSubmit={handleAddBlog}>
      <label>
        Title:
        <input name="title" value={blog.title} onChange={handleBlogChange} />
      </label>
      <br />
      <label>
        Author:
        <input name="author" value={blog.author} onChange={handleBlogChange} />
      </label>
      <br />
      <label>
        URL:
        <input name="url" value={blog.url} onChange={handleBlogChange} />
      </label>
      <br />
      <button type="submit">save</button>
    </form>
  );

  return (
    <div>
      <h2>blogs</h2>
      <Notification
        message={notification.message}
        variant={notification.variant}
      />
      {!user && loginForm()}
      {user && (
        <div>
          {" "}
          <p>
            {user.name} logged in{" "}
            <button onClick={handleLogout}>Log out </button>
          </p>{" "}
          {blogForm()}{" "}
        </div>
      )}
      <br />
      {blogs.map((blog) => (
        <Blog key={blog.id} blog={blog} />
      ))}
    </div>
  );
};

export default App;
