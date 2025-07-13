import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../store/userStore';
import AppNavigator from '../AppNavigator';

export default function Auth() {
  const [session, setSession] = useState<any>(null);
  const { initialize, user } = useUserStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        initialize();
      }
    });

    return () => subscription.unsubscribe();
  }, [initialize]);

  if (!session) {
    return <Auth />;
  } else {
    if (!user) {
      return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    return <AppNavigator />;
  }
}