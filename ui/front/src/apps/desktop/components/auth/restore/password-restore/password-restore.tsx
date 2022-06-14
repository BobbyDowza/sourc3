// import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { NavButton } from '@components/shared/nav-button';
import { InputCustom } from '@components/shared/input';
import React, { useRef } from 'react';
import styles from './password-restore.module.scss';

const STRENGTH_CRITERIA = [
  /^.{10,63}$/, // at least 10 chars
  /^(?=.*?[a-z])/, // at least 1 lower case char
  /^(?=.*?[A-Z])/, // at least 1 upper case char
  /^(?=.*?[0-9])/, //  at least 1 digit
  /^(?=.*?[" !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"])/ // at least 1 special char
];

function getStrengthTitle(value: number) {
  switch (value) {
    case 6:
      return 'Very strong';
    case 5:
      return 'Strong';
    case 3:
      return 'Medium strength';
    case 2:
      return 'Weak';
    case 1:
      return 'Very Weak';
    default:
      return null;
  }
}

type PasswordRestoreType = {
  onClick: (base: string, repeat:string) => void
};

function ratePassword(password: string): number {
  return STRENGTH_CRITERIA.reduce((result, regExp) => {
    const unit = regExp.test(password) ? 1 : 0;
    const bonus = result === 4 ? 1 : 0;
    return result + unit + bonus;
  }, 0);
}
const BARS_MAX = 6;
function PasswordRestore({ onClick }: PasswordRestoreType) {
  const [base, setBase] = React.useState('');
  const [repeat, setRepeat] = React.useState('');

  const matched = base === repeat;
  const valid = repeat === '' || matched;
  const ready = base !== '' && matched;

  const error = valid ? null : 'Passwords do not match';

  const points = ratePassword(base);
  const title = getStrengthTitle(points);

  const onClickDecor = () => onClick(base, repeat);

  console.log(ready);
  const bars = new Array(BARS_MAX).fill(null).map((v, index) => (index < points ? points : 0));

  const black = (num:any) => {
    switch (true) {
      case num >= 5:
        return 'black';
      case num === 3:
        return 'black';
      case num === 0:
        return 'rgba(0, 0, 0, 0.1)';
      default:
        return 'black';
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2>Password</h2>

      <p className={styles.description}>
        Enter a strong password.
        <br />
        The password is specific to each client and is only store locally.
      </p>

      <div className={styles.wrapperInput}>
        <InputCustom
          autoFocus
          password
          placeholder="Enter your password"
          onChange={(e) => setBase(e.target.value)}
        />
        <InputCustom
          valid={valid}
          label={error}
          placeholder="Confirm your password"
          onChange={(e) => setRepeat(e.target.value)}
          password={!!useRef}
        />

      </div>
      <div className={styles.wrapperList}>
        <ul className={styles.listStyled}>
          {bars.map((p, index) => (
            <li
              className={styles.listItemStyled}
              key={index}
              style={
                { backgroundColor: black(p) }
              }
            />
          ))}
        </ul>
        {title && (
          <span className={styles.strengthTitle}>
            {title}
            {' '}
            password
          </span>
        )}
      </div>
      <div className={styles.wrapperDescr}>
        <p className={styles.descrTitle}>
          Strong password needs to meet the following requirements:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            the length must be at least 10 characters
          </li>
          <li className={styles.listItem}>
            must contain at least one lowercase letter
          </li>
          <li className={styles.listItem}>
            must contain at least one uppercase letter
          </li>
          <li className={styles.listItem}>
            must contain at least one number
          </li>
        </ul>

      </div>
      <NavButton
        name="Get started"
        inlineStyles={{ width: '278px' }}
        onClick={onClickDecor}
        isDisabled={!ready}
      />
    </div>
  );
}
export default PasswordRestore;
