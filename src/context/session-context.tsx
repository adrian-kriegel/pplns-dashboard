
import type { User } from '@unologin/node-api';

import * as unologin from 'unologin-scripts';

import { get } from 'api';

import React, { useEffect } from 'react';

import LoginPage from 'components/login-page/login-page';

type SessionData = 
{
  user?: User;
};

type SessionContextValue =
[
  SessionData,
  () => Promise<void>,
];

const SessionContext = React.createContext<
  SessionContextValue
>(null as any);

unologin.setup({ appId: process.env.UNOLOGIN_APPID as string });

/**
 * 
 * @param data session data
 * @returns cookie-safe serialized string
 */
function serializeSessionData(data : SessionData)
{
  return encodeURIComponent(
    JSON.stringify(data),
  );
}

/**
 * @param str str
 * @returns session data 
 */
function deserializeSessionData(str : string) : SessionData
{
  return JSON.parse(
    decodeURIComponent(str)
  );
}

/**
 * 
 * @param param0 children
 * @returns provider for login session information
 */
export function SessionContextProvider(
  { children } : React.PropsWithChildren<{}>
)
{
  const [sessionData, setSessionData] = React.useState<SessionData>(
    () => 
    {
      if (unologin.isLoggedIn())
      {
        const cookieMatch = document.cookie.match(
          new RegExp('sessionData=([^;]+)')
        );
  
        return cookieMatch ? 
          deserializeSessionData(cookieMatch[1]) : {}
        ;
      }
      else 
      {
        return {};
      }
    },
  );

  const refreshSessionData = async () => 
  {
    let user : User | undefined;

    if (unologin.isLoggedIn())
    {
      try 
      {
        user = await get<User>('/me/get-login-info');
      }
      // TODO: error-handling (assuming that error means not logged in)
      // eslint-disable-next-line
      catch (e) { }
    }

    const newSessionData = {
      ...sessionData,
      user,
      isLoggedIn: !!user && unologin.isLoggedIn(),
    };

    if (user)
    {
      document.cookie = [
        'sessionData', '=',
        serializeSessionData(newSessionData),
        '; domain=.', window.location.hostname.toString(),
        ...(
          ('exp' in user) ? 
            ['; expires=', new Date((user as any).exp*1000).toUTCString()] : 
            []
        ),
        '; SameSite=Strict',
        '; path=/;',
      ].join('');
    }

    setSessionData(newSessionData);
  };
  
  useEffect(() => 
  {
    unologin.onLogin(refreshSessionData);
  }, []);

  return <SessionContext.Provider
    value={[sessionData, refreshSessionData]}
    children={children}
  />;
}

export const useSessionData = () => 
{
  const res = React.useContext(SessionContext);

  if (!res)
  {
    throw new Error(
      // eslint-disable-next-line max-len
      'Component must be child of SessionContextProvider in order to use useSessionData.'
    );
  }

  return res;
};

export const useUser = () => useSessionData()[0].user as User;

export const hasUserClass = (user : User | undefined, userClass : string) => 
  user?.userClasses.includes(userClass) ||
  user?.userClasses.find((str) => str.includes('super'))
;

export const withSession = <PropsType, >(
  Component: React.ComponentType<PropsType>
) => 
{
  return (props : PropsType) => 
  {
    const [{user}] = useSessionData();

    if (user)
    {
      return <Component {...props as any} />;
    }
    else 
    {
      return <LoginPage />;
    }
  };
};
