import { SYSTEM_USER } from '@/lib/constants';

export const authService = {
  async login(email, password) {
    console.log('AuthService: Checking credentials for:', email);

    const validCredentials = {
      email: 'user@gmail.com',
      password: 'user123'
    };

    if (email === validCredentials.email && password === validCredentials.password) {
      console.log('AuthService: Login successful');
      return {
        uid: 'unique_user_id',
        email: validCredentials.email,
        displayName: 'Actual User'
      };
    }

    console.log('AuthService: Invalid credentials');
    throw new Error('Invalid credentials');
  }
};