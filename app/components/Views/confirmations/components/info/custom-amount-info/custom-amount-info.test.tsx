import React from 'react';
import { merge, noop } from 'lodash';
import renderWithProvider from '../../../../../../util/test/renderWithProvider';
import { CustomAmountInfo, CustomAmountInfoProps } from './custom-amount-info';
import { simpleSendTransactionControllerMock } from '../../../__mocks__/controllers/transaction-controller-mock';
import { transactionApprovalControllerMock } from '../../../__mocks__/controllers/approval-controller-mock';
import { otherControllersMock } from '../../../__mocks__/controllers/other-controllers-mock';
import { useTransactionPayToken } from '../../../hooks/pay/useTransactionPayToken';
import { useTransactionCustomAmount } from '../../../hooks/transactions/useTransactionCustomAmount';
import { useConfirmationContext } from '../../../context/confirmation-context';
import { Alert } from '../../../types/alerts';
import {
  AlertsContextParams,
  useAlerts,
} from '../../../context/alert-system-context';
import { useTransactionCustomAmountAlerts } from '../../../hooks/transactions/useTransactionCustomAmountAlerts';

jest.mock('../../../hooks/ui/useClearConfirmationOnBackSwipe');
jest.mock('../../../hooks/pay/useAutomaticTransactionPayToken');
jest.mock('../../../hooks/pay/useTransactionPayToken');
jest.mock('../../../hooks/transactions/useTransactionCustomAmount');
jest.mock('../../../context/confirmation-context');
jest.mock('../../../context/alert-system-context');
jest.mock('../../../hooks/transactions/useTransactionCustomAmountAlerts');
jest.mock('../../../hooks/pay/useTransactionPayMetrics');

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));

function render(props: CustomAmountInfoProps = {}) {
  return renderWithProvider(<CustomAmountInfo {...props} />, {
    state: merge(
      {},
      simpleSendTransactionControllerMock,
      transactionApprovalControllerMock,
      otherControllersMock,
    ),
  });
}

describe('CustomAmountInfo', () => {
  const useTransactionPayTokenMock = jest.mocked(useTransactionPayToken);
  const useConfirmationContextMock = jest.mocked(useConfirmationContext);
  const useAlertsMock = jest.mocked(useAlerts);
  const useTransactionCustomAmountAlertsMock = jest.mocked(
    useTransactionCustomAmountAlerts,
  );

  const useTransactionCustomAmountMock = jest.mocked(
    useTransactionCustomAmount,
  );

  beforeEach(() => {
    jest.resetAllMocks();

    useTransactionPayTokenMock.mockReturnValue({
      payToken: {
        address: '0x123',
        balanceHuman: '0',
        balanceFiat: '0',
        balanceRaw: '0',
        balanceUsd: '0',
        chainId: '0x1',
        decimals: 18,
        symbol: 'TST',
      },
      setPayToken: noop as never,
    });

    useTransactionCustomAmountMock.mockReturnValue({
      amountFiat: '123.45',
      amountHuman: '0',
      amountHumanDebounced: '0',
      hasInput: true,
      isInputChanged: false,
      updatePendingAmount: noop,
      updatePendingAmountPercentage: noop,
      updateTokenAmount: noop,
    });

    useConfirmationContextMock.mockReturnValue({
      setIsFooterVisible: noop,
    } as ReturnType<typeof useConfirmationContext>);

    useAlertsMock.mockReturnValue({
      alerts: [] as Alert[],
      generalAlerts: [] as Alert[],
      fieldAlerts: [] as Alert[],
    } as AlertsContextParams);

    useTransactionCustomAmountAlertsMock.mockReturnValue({
      alertTitle: undefined,
      alertMessage: undefined,
    });
  });

  it('renders amount', () => {
    const { getByText } = render();

    expect(getByText('123.45')).toBeOnTheScreen();
  });

  it('renders payment token', () => {
    const { getByText } = render();
    expect(getByText('0 TST')).toBeDefined();
  });

  it('does not render payment token if disablePay', () => {
    const { queryByText } = render({ disablePay: true });
    expect(queryByText('TST')).toBeNull();
  });

  it('renders alert', () => {
    useTransactionCustomAmountAlertsMock.mockReturnValue({
      alertTitle: 'Test Alert Title',
      alertMessage: 'Test Alert Message',
    });

    const { getByText } = render();

    expect(getByText('Test Alert Title')).toBeDefined();
    expect(getByText('Test Alert Message')).toBeDefined();
  });

  it('renders keyboard', () => {
    const { getByTestId } = render();
    expect(getByTestId('deposit-keyboard')).toBeDefined();
  });
});
