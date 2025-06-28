import React, { useState } from 'react';
import { View, Button, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function Auth() {
        const nav = useNavigation();
          const [loading, setLoading] = useState(false);
            const [email, setEmail] = useState('');
              const [password, setPassword] = useState('');

                const handleAuth = async (type: 'SIGNIN' | 'SIGNUP') => {
                      try {
                              setLoading(true);
                                    let { data, error } =
                                            type === 'SIGNUP'
                                                      ? await supabase.auth.signUp({ email, password })
                                                                : await supabase.auth.signInWithPassword({ email, password });
                                                                      if (error) throw error;
                                                                            const user = data.user;
                                                                                  if (!user) throw new Error('No user r')
                      }
                }
}