import React, { FunctionComponent } from 'react';
import { Loader2 } from 'lucide-react';

interface OwnProps { }

type Props = OwnProps;

const FullPageLoader: FunctionComponent<Props> = () => {
  return (
    <div className="flex flex-1 w-full min-h-screen justify-center items-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};

export default FullPageLoader;
