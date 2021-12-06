import { NotificationElement } from '@components/shared';
import {
  AC,
  AppThunkDispatch, RootState, thunks
} from '@libs/redux';
import { SetPropertiesType, TxItem, TxResponse } from '@types';
import { connect } from 'react-redux';

type NotificationProps = {
  txs: TxItem[],
  checkTxStatus:(txId: string, callback: SetPropertiesType<TxResponse>) => void
  removeTx: (txItem: TxItem) => void,
  setNotifiedTrue: (txItem: TxItem) => void
};

const Notifications = ({
  txs, checkTxStatus, removeTx, setNotifiedTrue
}: NotificationProps) => {
  const maped = txs.map(
    (el) => (
      <NotificationElement
        key={el.id}
        txItem={el}
        checkTxStatus={checkTxStatus}
        removeTx={removeTx}
        setNotifiedTrue={setNotifiedTrue}
      />
    )
  );
  return <>{maped}</>;
};

const MapState = ({ app: { txs } }: RootState) => ({
  txs: Array.from(txs)
});

const MapDispatch = (dispatch: AppThunkDispatch) => ({
  checkTxStatus: (txId: string, callback: SetPropertiesType<TxResponse>) => {
    dispatch(thunks.getTxStatus(txId, callback));
  },
  removeTx: (txItem: TxItem) => {
    dispatch(AC.removeTx(txItem));
  },
  setNotifiedTrue: (txItem: TxItem) => {
    dispatch(AC.setTxNotifyTrue(txItem));
  }
});

export default connect(MapState, MapDispatch)(Notifications);
