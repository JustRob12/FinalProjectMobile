import { GoogleSignin, SignInResponse } from '@react-native-google-signin/google-signin';
import { GoogleUser } from '../types/auth';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    // You'll need to replace this with your actual web client ID from Google Cloud Console
    webClientId: '125654982937-tqa5qdg44oh386bg8fo5itdsa4jp1cnv.apps.googleusercontent.com',
    // Add any additional configuration options here
    offlineAccess: true,
  });
};

export const signInWithGoogle = async (): Promise<GoogleUser> => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn() as SignInResponse & { user: GoogleUser };
    if (!response || !response.user) {
      throw new Error('No user data received from Google Sign-In');
    }
    return response.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
    throw error;
  }
}; 