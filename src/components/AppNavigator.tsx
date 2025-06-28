import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../lib/supabase';
import Auth from './Auth';
import Main from './Main';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);

      useEffect(() => {
          const { data: sub } = supabase.auth.onAuthStateChange(
                async (event, session) => {
                        if (session?.user) {
                                  const { data: profile, error } = await supabase
                                              .from('user_profiles')
                                                          .select('*')
                                                                      .eq('id', session.user.id)
                                                                                  .single();
                                                                                            if (error) {
                                                                                                            console.error(error);
                                                                                                                        Alert.alert('Error fetching profile', error.message);
                                                                                            } else {
                                                                                                            setUserProfile(profile);
                                                                                            }
                                                                                        } else {
                                                                                                      setUserProfile(null);
                                                                                        }
                                                                                                setInitializing(false);
                                                                                    }
          );

              (async () => {
                      const { data: { session } } = await supabase.auth.getSession();
                            if (session?.user) {
                                        const { data: profile, error } = await supabase
                                                  .from('user_profiles')
                                                            .select('*')
                                                                      .eq('id', session.user.id)
                                                                                .single();
                                                                                        if (!error) setUserProfile(profile);
                            }
                                  setInitializing(false);
                        })();

                            return () => sub.subscription.unsubscribe();
                    }, []);

                      if (initializing) return (
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                      <ActivityIndicator size="large" />
                                          </View>
                      );

                        return (
                                <NavigationContainer>
                                        <Stack.Navigator>/>
                                              </View>
                                                );
                                                }
                                                    {userProfile ? (
                                                                  <Stack.Screen name="Main">
                                                                                {props => <Main {...props} profile={userProfile} />}
                                                                                          </Stack.Screen>.Screen>
                                                    ) : (
                                                                  <Stack.Screen
                                                                              name="Auth"
                                                                                          component={Auth}
                                                                                                      options={{ headerShown: false }}
                                                                                                                />
                                                    )}
                                                          </Stack.Navigator>
                                                              </NavigationContainer>  );
}
                                                    )
                                                    )}
                        )
                      )
                            }
              })
                                                                                        }
                                                                                            }
                                                                                            }