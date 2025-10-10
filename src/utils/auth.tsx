import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export interface User {
  id: string;
  email: string;
  name?: string;
}

export async function signUp(email: string, password: string, name: string) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-ade39ab0/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to sign up');
    }

    // Now sign in the user
    return signIn(email, password);
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
      },
      accessToken: data.session.access_token,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signInWithGoogle() {
  try {
    // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

export async function signInWithGithub() {
  try {
    // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-github
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('GitHub sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (data.session) {
      return {
        user: {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.name,
        },
        accessToken: data.session.access_token,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

export function onAuthStateChange(callback: (user: User | null, accessToken: string | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback(
        {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
        },
        session.access_token
      );
    } else {
      callback(null, null);
    }
  });
}
