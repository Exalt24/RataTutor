import { Routes, Route } from 'react-router-dom';
import { routes } from './routes';

export default function App() {
  return (
    <Routes>
      {routes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Routes>
  );
}
