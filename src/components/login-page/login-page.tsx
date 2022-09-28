
import * as unologin from 'unologin-scripts';

import Button from '@unologin/react-ui/inputs/button';

import './login-page.scss';

/**
 * @returns basic login page
 */
export default function LoginPage(
  {
    message,
  } : { message?: string | JSX.Element }
)
{
  message ||= <>
    <h1>
      Login required.
    </h1>
  </>;

  return (
    <div className='login-page'>
      { message }
      <br/>
      <div className='login-button'>
        <div className='login-button-left'>
          <Button
            label='log in'
            onClick={
              () =>
              {
                unologin.startLogin(
                  { mode: 'login', userClass: 'users_default' }
                );
              }
            }
          />
        </div>
        <div className='login-button-right'>
          <Button
            label='register'
            onClick={
              () =>
              {
                unologin.startLogin(
                  { mode: 'register', userClass: 'users_default' }
                );
              }
            }
          />
        </div>
      </div>
    </div>
  );
}
