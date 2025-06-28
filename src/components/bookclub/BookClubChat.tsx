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
                                          const { data: profile, error } = await supabase          .from('user_profiles')
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
                                              <Stack.Navigator>
                                                        {userProfile ? (
                                                                    <Stack.Screen name="Main">
                                                                                  {props => <Main {...props} profile={userProfile} />}
                                                                                            </Stack.Screen>
                                                        ) : (
                                                                    <Stack.Screen
                                                                                name="Auth"
                                                                                            component={Auth}
                                                                                                        options={{ headerShown: false }}
                                                                                                                  />
                                                        )}
                                                              </Stack.Navigator>
                                                                  </NavigationContainer>
                                );
                                }
                                import React, { useState } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { mockUser } from '../../utils/mockData';

const BookClubChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages] = useState([
    {
      id: '1',
      user: mockUser,
      content: "That scene in Chapter 3 though! 🔥",
      timestamp: new Date(),
      isNSFW: true
    },
    {
      id: '2',
      user: { ...mockUser, username: 'bookworm2' },
      content: "I can't believe she actually did that!",
      timestamp: new Date(),
      isNSFW: false
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Add message logic here
      setMessage('');
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex-grow overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-3">
            <img
              src={msg.user.profilePicture}
              alt={msg.user.username}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{msg.user.username}</span>
                <span className="text-xs text-neutral-500">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
                {msg.isNSFW && (
                  <span className="text-xs bg-error-100 text-error-600 px-2 py-0.5 rounded-full flex items-center">
                    <AlertTriangle size={12} className="mr-1" />
                    NSFW
                  </span>
                )}
              </div>
              <p className="mt-1 text-neutral-700">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow"
        />
        <Button type="submit" className="flex items-center">
          <Send size={18} className="mr-2" />
          Send
        </Button>
      </form>
    </div>
  );
};

export default BookClubChat;