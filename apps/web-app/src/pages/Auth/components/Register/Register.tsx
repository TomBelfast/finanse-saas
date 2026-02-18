import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';

interface OwnProps {}

type Props = OwnProps;

const signUpAppearance = {
  variables: {
    colorPrimary: '#84cc16',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    colorBackground: '#ffffff',
    colorInputBackground: '#f8fafc',
    colorInputText: '#0f172a',
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full !overflow-hidden !rounded-[28px] !border !border-slate-200/80 !bg-white !shadow-[0_35px_80px_-45px_rgba(15,23,42,0.82)]',
    card: '!m-0 !w-full !rounded-none !border-0 !bg-transparent !p-7 sm:!p-8 !shadow-none',
    main: 'space-y-5',
    headerTitle: '!text-4xl !font-semibold !tracking-tight !text-slate-900',
    headerSubtitle: '!mt-2 !text-base !text-slate-500',
    socialButtonsBlockButton:
      '!h-12 !rounded-xl !border !border-slate-200 !bg-white !text-slate-700 !shadow-sm hover:!bg-slate-50',
    socialButtonsBlockButtonText: '!text-base !font-medium !text-slate-700',
    dividerRow: '!my-5',
    dividerLine: '!bg-slate-200',
    dividerText: '!text-xs !font-semibold !uppercase !tracking-[0.16em] !text-slate-400',
    formFieldLabel: '!text-sm !font-semibold !text-slate-700',
    formFieldInput:
      '!h-12 !rounded-xl !border !border-slate-200 !bg-slate-50 !text-slate-900 !shadow-sm focus:!border-lime-500',
    formButtonPrimary:
      '!h-12 !rounded-xl !bg-lime-500 !text-sm !font-semibold !text-slate-900 !shadow-lg !shadow-lime-500/30 hover:!bg-lime-400',
    footer:
      '!m-0 !rounded-none !border-0 !border-t !border-slate-200/80 !bg-transparent !px-6 !pb-5 !pt-4 [&>div:last-child]:hidden',
    footerAction: '!m-0 !p-0 !bg-transparent',
    footerActionText: '!text-sm !text-slate-500',
    footerActionLink: '!text-sm !font-semibold !text-slate-900 hover:!text-slate-700',
  },
};

export const Register: FunctionComponent<Props> = () => {
  const history = useHistory();
  const query = new URLSearchParams(history.location.search);
  const continuePath = query.get('continue') || '/';

  return (
    <div className="flex flex-1 justify-center">
      <div className="w-full max-w-[430px]">
        <SignUp
          routing="path"
          path="/auth/register"
          signInUrl="/auth/login"
          afterSignUpUrl={continuePath}
          appearance={signUpAppearance}
        />
      </div>
    </div>
  );
};
