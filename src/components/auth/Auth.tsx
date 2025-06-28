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
                                                                                  if (!user) throw new Error('No user returned');

                                                                                        const { data: profile, error: profErr } = await supabase
                                                                                                .from('user_profiles')
                                                                                                        .select('id, full_name, avatar_url')
                                                                                                                .eq('id', user.id)
                                                                                                                        .single();
                                                                                                                              if (profErr) throw profErr;

                                                                                                                                    nav.reset({ index: 0, routes: [{ name: 'Main', params: { profile } }] });
                                                                                                                                        } catch (err: any) {
                                                                                                                                              console.error(err);
                                                                                                                                                    Alert.alert('Authentication Error', err.message);
                                                                                                                                        } finally {
                                                                                                                                                  setLoading(false);
                                                                                                                                        }
                                                                                                                                          };

                                                                                                                                            if (loading) {
                                                                                                                                                    return (
                                                                                                                                                              <View style={{ flex: 1, justifyContent: 'center' }}>
                                                                                                                                                                        <ActivityIndicator size="large" />
                                                                                                                                                                              </View>
                                                                                                                                                    );
                                                                                                                                                    }

                                                                                                                                                      return (
                                                                                                                                                          <View style={{ padding: 20 }}>
                                                                                                                                                                  <TextInput
                                                                                                                                                                          placeholder="Email"
                                                                                                                                                                                  value={email}
                                                                                                                                                                                          onChangeText={setEmail}
                                                                                                                                                                                                  autoCapitalize="none"
                                                                                                                                                                                                          keyboardType="email-address"
                                                                                                                                                                                                                  style={{ marginBottom: 12, borderBottomWidth: 1, padding: 8 }}
                                                                                                                                                                                                                        />
                                                                                                                                                                                                                              <TextInput
                                                                                                                                                                                                                                      placeholder="Password"
                                                                                                                                                                                                                                              value={password}
                                                                                                                                                                                                                                                      onChangeText={setPassword}
                                                                                                                                                                                                                                                              secureTextEntry
                                                                                                                                                                                                                                                                      style={{ marginBottom: 20, borderBottomWidth: 1, padding: 8 }}
                                                                                                                                                                                                                                                                            />
                                                                                                                                                                                                                                                                                  <Button title="Sign In" onPress={() => handleAuth('SIGNIN')} />
                                                                                                                                                                                                                                                                                        <View style={{ height: 10 }} />
                                                                                                                                                                                                                                                                                              <Button title="Sign Up" onPress={() => handleAuth('SIGNUP')} />
                                                                                                                                                                                                                                                                                                  </View>
                                                                                                                                                      );
}
                                                                                                                                                    )
                                                                                                                                            }
                                                                                                                                        }
                    }
              }
}