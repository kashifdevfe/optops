import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.js';
import { initializeAuth } from '../../store/slices/authSlice.js';

export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const [hasInitialized, setHasInitialized] = useState(false);
  const hasInitializedRef = useRef(false); // Prevent duplicate calls

  useEffect(() => {
    // Prevent duplicate initialization (especially important with React.StrictMode)
    if (hasInitializedRef.current) {
      return;
    }

    let isMounted = true;
    
    const init = async () => {
      const stored = localStorage.getItem('optops_auth');
      if (stored) {
        try {
          await dispatch(initializeAuth()).unwrap();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
        }
      }
      if (isMounted) {
        hasInitializedRef.current = true;
        setHasInitialized(true);
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  if (!hasInitialized || isLoading) {
    return null;
  }

  return <>{children}</>;
};

