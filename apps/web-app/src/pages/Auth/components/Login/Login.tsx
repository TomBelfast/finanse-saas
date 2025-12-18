import React, { FunctionComponent } from 'react';
// import * as styles from './Login.module.scss';

import { Trans, useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';

interface OwnProps { }

type Props = OwnProps;

type LoginFormModel = {
  email: string;
  password: string;
};

const Login: FunctionComponent<Props> = () => {
  const { t } = useTranslation(['auth', 'common']);
  const history = useHistory();
  const query = new URLSearchParams(history.location.search);
  const continuePath = query.get('continue') || '/';

  return (
    <div className="flex flex-1 justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="min-w-[350px] p-2.5">
        <SignIn
          routing="path"
          path="/auth/login"
          signUpUrl="/auth/register"
          fallbackRedirectUrl={continuePath}
          forceRedirectUrl={continuePath}
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-none p-0",
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;
