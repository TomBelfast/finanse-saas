import React, { FunctionComponent } from 'react';
import { Stepper as CustomStepper } from '~/components/ui/stepper';
import { useTranslation } from 'react-i18next';
import * as styles from './Stepper.module.scss';


interface OwnProps {
  current: number;
}

type Props = OwnProps;

const renderCustomDot = (dot: React.ReactElement) => <span>{dot}</span>;

const Stepper: FunctionComponent<Props> = ({ current = 0 }) => {
  const { t } = useTranslation('checkout');

  const steps = [
    { title: t<string>('stepper.invoiceData') },
    { title: t<string>('stepper.payment') },
    { title: t<string>('stepper.access') },
  ];

  return (
    <div className={styles.stepper}>
      <CustomStepper current={current} steps={steps} />
    </div>
  );
};

export default Stepper;
