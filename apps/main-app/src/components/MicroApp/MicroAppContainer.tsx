import React from 'react';
import { MicroAppWrapper, useMicroApp } from '@enterprise/shared-components';

import { useAppSelector, useAppDispatch } from '@/store';
import {
  setActiveApp,
  addLoadingApp,
  addLoadedApp,
  setAppError,
} from '@/store/slices/microAppSlice';

interface MicroAppContainerProps {
  name: string;
  containerId: string;
}

const MicroAppContainer: React.FC<MicroAppContainerProps> = ({
  name,
  containerId,
}) => {
  const dispatch = useAppDispatch();
  const { errorApps } = useAppSelector(state => state.microApp);

  const { loading, error, reload } = useMicroApp({
    name,
    container: `#${containerId}`,
    onLoad: () => {
      dispatch(addLoadedApp(name));
      dispatch(setActiveApp(name));
    },
    onError: (error) => {
      dispatch(setAppError({
        app: name,
        error: error.message,
      }));
    },
  });

  const handleRetry = () => {
    reload();
  };

  return (
    <MicroAppWrapper
      name={name}
      containerId={containerId}
      loading={loading}
      error={error || errorApps[name]}
      onRetry={handleRetry}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px',
      }}
    />
  );
};

export default MicroAppContainer;
