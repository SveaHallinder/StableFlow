import * as React from 'react';
import { useState } from 'react';
import { Alert, StyleSheet, View, AppState, TouchableOpacity, TextInput, Text, Image } from 'react-native';
import { supabase } from '../../lib/supabase';
import Logo from '../../../assets/logo.svg';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
        <View style={styles.container}>
          <View style={styles.logo}>
          <Logo width={35} height={35} />
          </View>
          <View style={styles.title}>
            <Text style={styles.titleText}>Create an account</Text>
            <Text style={styles.subtitleText}>Create an account with stableflow to manage and organize your stables to keep it stable.</Text>
          </View>
            <View style={styles.inputContainer}>
              <Text>Your email address</Text>
              <TextInput
                  style={[styles.input]}
                  onChangeText={(text) => setEmail(text)}
                  value={email}
                  placeholder="Your email address"
                  autoCapitalize={'none'}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text>Choose a password</Text>
            <TextInput
                style={[styles.input]}
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={true}
                placeholder="Choose a password"
            />
            </View>
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#000000' }]}
                onPress={() => signInWithEmail()}
                disabled={loading}
            >
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
            <Text style={styles.orText}>or</Text>
            <TouchableOpacity style={styles.socialButton}>
                <Image source={(require as any)('../../../assets/Google-logo.png')} style={styles.icons} />
                <Text>Sign up with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
                <Image source={(require as any)('../../../assets/apple-logo.png')} style={styles.icons} />
                <Text>Sign up with Apple</Text>
            </TouchableOpacity>
        </View>
  )
}

const styles = StyleSheet.create({
      container: {
        flex: 1,
        paddingTop: 85,
        backgroundColor: 'white',
        alignItems: 'center',
      },
    verticallySpaced: {
        width: '100%',
    },
    mt20: {
        marginTop: 40,
    },
    inputContainer: {
      margin: 10,
      gap: 10,
    },
    input: {
        width: 350,
        height: 50,
        borderColor: '#F5F5F5',
        borderWidth: 1,
        borderRadius: 50,
        paddingLeft: 15,
        marginBottom: 15,
      },
      button: {
        width: 350,
        height: 50,
        borderRadius: 50,
        paddingLeft: 15,
        marginBottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
      },
      buttonText: {
        color: 'white',
        fontWeight: 500,
        textAlign: 'center',
        fontSize: 15,
      },
      title: {
        width: 350,
        marginBottom: 50,
    },
    titleText: {
      fontSize: 26,
      marginBottom: 10,
      fontWeight: 500,
    },
    subtitleText: {
        opacity: 0.5,
    },
    orText: {
        fontSize: 15,
        marginVertical: 15,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 350,
        height: 50,
        borderRadius: 50,
        paddingLeft: 15,
        marginBottom: 15,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderColor: '#F5F5F5',
        borderWidth: 1,
        justifyContent: 'center',
    },
    logo: {
      marginBottom: 75,
      marginTop: -10,
  },
  icons: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
})