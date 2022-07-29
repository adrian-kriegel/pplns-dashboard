
import { createRoot } from 'react-dom/client';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import PageContent from '@unologin/react-ui/layout/page-content';


import '@unologin/react-ui/style.scss';
import '@unologin/react-ui/font.scss';
import '@fontsource/nunito';

import Tasks from './components/tasks/tasks';
import Flow from './components/flow/flow';
import Workers from './components/workers/workers';
import TaskDetails from './components/tasks/task-details';


const App = () => 
  <>
    <PageContent>
      <Routes>
        <Route path='/tasks'>
          <Route index element={<Tasks />} />
          <Route
            path=':taskId' 
            element={<TaskDetails />}
          />
        </Route>

        <Route path='/workers'>
          <Route index element={<Workers />} />
          <Route path=':workerId' element={<Flow />} />
        </Route>
      </Routes>
    </PageContent>
  </>
;

const root = createRoot(
  document.getElementById('root') as HTMLDivElement
);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
