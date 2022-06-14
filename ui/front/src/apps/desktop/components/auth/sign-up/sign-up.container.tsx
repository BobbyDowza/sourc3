import { useCallback } from 'react';
import { Preload } from '@components/shared';
import { MODE } from '@libs/constants';
import { useSignUp } from '@libs/hooks/container/sign-up';
import styles from './sign-up.module.scss';
import { UpdatingNode } from '../update-node';
import { SeedGenerate } from './seed-generate';
import { SeedConfirm } from './seed-confirm';
import { PasswordRestore } from '../restore/password-restore';
import { AuthInfo } from './auth-info';

function SignUp() {
  const {
    seed, mode, setNextMode, statusFetcher, endOfVerification, throwError
  } = useSignUp();

  const CurrentMode = useCallback(() => {
    switch (mode) {
      case MODE.AUTHINFO:
        return (
          <AuthInfo next={setNextMode} />
        );
      case MODE.SEED:
        return <SeedGenerate seed={seed} next={setNextMode} />;

      case MODE.CONFIRM:
        return <SeedConfirm seedGenerated={seed} next={setNextMode} />;

      case MODE.PASS:
        return <PasswordRestore onClick={endOfVerification} />;

      case MODE.OK:
        return (
          <div className={styles.syncStatusWrapper}>
            <UpdatingNode backButton statusFetcher={statusFetcher} errorCatcher={throwError} />
          </div>
        );
        // TODO: DANIK: make a generalized component

      case MODE.LOADING:
        return <Preload message="loading" />;
      default:
        break;
    }
    return <>no data</>;
  }, [mode, seed]);

  return (
    <div className={styles.wrapper}>
      <CurrentMode />
    </div>
  );
}

export default SignUp;
