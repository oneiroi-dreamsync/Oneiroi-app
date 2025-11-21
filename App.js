import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [dream, setDream] = useState('');
  const [dreams, setDreams] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const postDream = async () => {
    if (!user) return Alert.alert('Please sign in');
    const { error } = await supabase
      .from('dreams')
      .insert({ content: dream, user_id: user.id });
    if (!error) {
      setDream('');
      loadDreams();
    }
  };

  const loadDreams = async () => {
    const { data } = await supabase
      .from('dreams')
      .select('*')
      .order('created_at', { ascending: false });
    setDreams(data || []);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oneiroi 🌙</Text>
      
      {!user ? (
        <Button title="Sign in with Google" onPress={signIn} />
      ) : (
        <>
          <Text style={{ color: '#aaa', textAlign: 'center' }}>
            Signed in as {user.email}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="What did you dream last night?"
            placeholderTextColor="#666"
            value={dream}
            onChangeText={setDream}
            multiline
          />
          <Button title="Share Dream" onPress={postDream} />
          <Button title="Refresh Feed" onPress={loadDreams} />
          <FlatList
            data={dreams}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.dream}>
                <Text style={{ color: '#eee' }}>{item.content}</Text>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0d0d1a' },
  title: { fontSize: 36, color: '#8a7cff', textAlign: 'center', marginVertical: 40 },
  input: { backgroundColor: '#1a1a2e', color: 'white', padding: 15, borderRadius: 12, marginVertical: 15, height: 120 },
  dream: { backgroundColor: '#162033', padding: 15, borderRadius: 12, marginVertical: 6 },
  date: { color: '#666', fontSize: 11, marginTop: 6 },
});
