import React, { FunctionComponent } from 'react';
// import * as styles from './Register.module.scss';
import { useHistory } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';

interface OwnProps { }

type Props = OwnProps;

export const Register: FunctionComponent<Props> = () => {
  const history = useHistory();
  const query = new URLSearchParams(history.location.search);
  const continuePath = query.get('continue') || '/';

  return (
    <div className="flex flex-1 justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="min-w-[350px] p-2.5">
        <SignUp
          routing="path"
          path="/auth/register"
          signInUrl="/auth/login"
          afterSignUpUrl={continuePath}
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
