
import { createRoot } from 'react-dom/client';

import {
  BrowserRouter,
  Switch,
  Route,
} from 'react-router-dom';

import PageContent from '@unologin/react-ui/layout/page-content';


import '@unologin/react-ui/style.scss';
import '@unologin/react-ui/font.scss';
import '@fontsource/nunito';

import Tasks from './components/tasks/tasks';

import TaskDetails from './components/tasks/task-details';
import { SessionContextProvider, withSession } from 'context/session-context';


const App = () => 
  <>
    <PageContent>
      <Switch>
        <Route path='/tasks' exact={true} component={Tasks} />
        <Route
          path='/tasks/:taskId' 
          component={TaskDetails}
        />
      </Switch>
    </PageContent>
  </>
;

const AppWithLogin = withSession(App);

const root = createRoot(
  document.getElementById('root') as HTMLDivElement
);

root.render(
  <BrowserRouter>
    <SessionContextProvider>
      <AppWithLogin />
    </SessionContextProvider>
  </BrowserRouter>,
);
