import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatView from './pages/ChatView';

/**
 * 为什么用 createBrowserRouter 而不是 BrowserRouter：
 * React Router v7 的 BrowserRouter basename 行为有变化，
 * GitHub Pages 的 URL 带尾部斜杠 (/LLM-chat-box2.0-React/)
 * 导致 basename 匹配失败。createBrowserRouter 是 v7 推荐的 API，
 * basename 处理更可靠。
 */
const router = createBrowserRouter(
  [
    { path: "/", element: <HomePage /> },
    { path: "/chat", element: <ChatView /> },
  ],
  {
    basename: "/LLM-chat-box2.0-React",
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
