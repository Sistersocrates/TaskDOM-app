import React, { useState } from 'react';
import { View, Button, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

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
    return <AppNavigator user={user} />;
  }
}