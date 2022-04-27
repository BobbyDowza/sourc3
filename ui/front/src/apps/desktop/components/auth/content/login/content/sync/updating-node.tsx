import { NavButton } from '@components/shared';
import useFetch from '@libs/hooks/shared/useFetch';
import { Progress, Typography } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

type UpdatingNodeProps = {
  statusFetcher: (resolve: PromiseArg<{ status: number }>) => void,
  errorCatcher: (e: Error) => void
};

const initial = { status: 0 }; // need to cycle rerender component

function UpdatingNode({ statusFetcher, errorCatcher }:UpdatingNodeProps) {
  const navigate = useNavigate();
  const { status } = useFetch(statusFetcher, initial, errorCatcher);
  console.log('updating node: ', status);

  useEffect(() => {
    if (status === 100) navigate('/main');
  }, [status]);

  return (
    <>
      <Text style={{ margin: '0 auto 30px' }}>
        Updating node
      </Text>
      <Progress
        strokeColor={{
          from: '#108ee9',
          to: '#87d068'
        }}
        percent={status}
        status="active"
      />
      <div style={{ margin: '30px auto 0' }}>
        <NavButton
          name="Back"
          link="/auth"
        />
      </div>
    </>
  );
}

export default UpdatingNode;
