
import ReactDOM from 'react-dom';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import '@unologin/react-ui/style.scss';
import '@unologin/react-ui/font.scss';

import '@fontsource/nunito';

import Tasks from './tasks';

const App = () => 
  <Routes>
    <Route path='/tasks'>
      <Route index element={<Tasks />} />
      <Route path=':taskId' />
    </Route>
  </Routes>
;

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root'),
);
