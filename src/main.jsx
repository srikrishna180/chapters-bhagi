import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, redirect } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import Root from './routes/Root.jsx';
import Cover from './routes/Cover.jsx';
import Chapter, { chapterLoader } from './routes/Chapter.jsx';
import Finale from './routes/Finale.jsx';
import 'd3-transition'; // adds .transition() and .interrupt() to D3 selections
import './styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Cover },
      { path: 'chapter/:n', loader: chapterLoader, Component: Chapter },
      { path: 'finale', Component: Finale },
      { path: '*', loader: () => redirect('/') },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
