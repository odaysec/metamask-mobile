import React, { ReactNode, memo, useCallback, useState } from 'react';
import { PayTokenAmount, PayTokenAmountSkeleton } from '../../pay-token-amount';
import { PayWithRow, PayWithRowSkeleton } from '../../rows/pay-with-row';
import { BridgeFeeRow } from '../../rows/bridge-fee-row';
import { BridgeTimeRow } from '../../rows/bridge-time-row';
import { TotalRow } from '../../rows/total-row';
import {
  DepositKeyboard,
  DepositKeyboardSkeleton,
} from '../../deposit-keyboard';
import { Box } from '../../../../../UI/Box/Box';
import { useStyles } from '../../../../../hooks/useStyles';
import styleSheet from './custom-amount-info.styles';
import { useTransactionCustomAmount } from '../../../hooks/transactions/useTransactionCustomAmount';
import { useTransactionCustomAmountAlerts } from '../../../hooks/transactions/useTransactionCustomAmountAlerts';
import useClearConfirmationOnBackSwipe from '../../../hooks/ui/useClearConfirmationOnBackSwipe';
import { useAutomaticTransactionPayToken } from '../../../hooks/pay/useAutomaticTransactionPayToken';
import { AlertMessage } from '../../alerts/alert-message';
import {
  CustomAmount,
  CustomAmountSkeleton,
} from '../../transactions/custom-amount';
import {
  useIsTransactionPayLoading,
  useTransactionPayQuotes,
  useTransactionPaySourceAmounts,
} from '../../../hooks/pay/useTransactionPayData';
import { useTransactionPayMetrics } from '../../../hooks/pay/useTransactionPayMetrics';
import Button, {
  ButtonVariants,
  ButtonWidthTypes,
} from '../../../../../../component-library/components/Buttons/Button';
import { strings } from '../../../../../../../locales/i18n';
import { useAlerts } from '../../../context/alert-system-context';
import { useTransactionConfirm } from '../../../hooks/transactions/useTransactionConfirm';

export interface CustomAmountInfoProps {
  children?: ReactNode;
  currency?: string;
  disablePay?: boolean;
}

export const CustomAmountInfo: React.FC<CustomAmountInfoProps> = memo(
  ({ children, currency, disablePay }) => {
    useClearConfirmationOnBackSwipe();
    useAutomaticTransactionPayToken({ disable: disablePay });
    useTransactionPayMetrics();

    const { styles } = useStyles(styleSheet, {});
    const [isKeyboardVisible, setKeyboardVisible] = useState(true);

    const isResultReady = useIsResultReady({
      isKeyboardVisible,
    });

    const {
      amountFiat,
      amountHuman,
      amountHumanDebounced,
      hasInput,
      isInputChanged,
      updatePendingAmount,
      updatePendingAmountPercentage,
      updateTokenAmount,
    } = useTransactionCustomAmount({ currency });

    const { alertMessage, alertTitle } = useTransactionCustomAmountAlerts({
      isInputChanged,
      pendingTokenAmount: amountHumanDebounced,
    });

    const handleDone = useCallback(async () => {
      await updateTokenAmount();
      setKeyboardVisible(false);
    }, [updateTokenAmount]);

    const handleAmountPress = useCallback(() => {
      setKeyboardVisible(true);
    }, []);

    return (
      <Box style={styles.container}>
        <Box>
          <CustomAmount
            amountFiat={amountFiat}
            currency={currency}
            hasAlert={Boolean(alertMessage)}
            onPress={handleAmountPress}
          />
          {disablePay !== true && <PayTokenAmount amountHuman={amountHuman} />}
          {children}
          {disablePay !== true && <PayWithRow />}
        </Box>
        <Box gap={25}>
          <AlertMessage alertMessage={alertMessage} />
          {isResultReady && (
            <Box>
              <BridgeFeeRow />
              <BridgeTimeRow />
              <TotalRow />
            </Box>
          )}
          {isKeyboardVisible && (
            <DepositKeyboard
              alertMessage={alertTitle}
              value={amountFiat}
              onChange={updatePendingAmount}
              onDonePress={handleDone}
              onPercentagePress={updatePendingAmountPercentage}
              hasInput={hasInput}
            />
          )}
          {!isKeyboardVisible && <ConfirmButton alertTitle={alertTitle} />}
        </Box>
      </Box>
    );
  },
);

export function CustomAmountInfoSkeleton() {
  const { styles } = useStyles(styleSheet, {});

  return (
    <Box style={styles.container}>
      <Box>
        <CustomAmountSkeleton />
        <PayTokenAmountSkeleton />
        <PayWithRowSkeleton />
      </Box>
      <DepositKeyboardSkeleton />
    </Box>
  );
}

function ConfirmButton({ alertTitle }: { alertTitle: string | undefined }) {
  const { styles } = useStyles(styleSheet, {});
  const { hasBlockingAlerts } = useAlerts();
  const isLoading = useIsTransactionPayLoading();
  const { onConfirm } = useTransactionConfirm();
  const disabled = hasBlockingAlerts || isLoading;

  return (
    <Button
      style={[disabled && styles.disabledButton]}
      label={alertTitle ?? strings('confirm.deposit_edit_amount_done')}
      variant={ButtonVariants.Primary}
      width={ButtonWidthTypes.Full}
      disabled={disabled}
      onPress={onConfirm}
    />
  );
}

function useIsResultReady({
  isKeyboardVisible,
}: {
  isKeyboardVisible: boolean;
}) {
  const quotes = useTransactionPayQuotes();
  const isQuotesLoading = useIsTransactionPayLoading();
  const sourceAmounts = useTransactionPaySourceAmounts();

  return (
    !isKeyboardVisible &&
    (isQuotesLoading || Boolean(quotes?.length) || !sourceAmounts?.length)
  );
}
