import credentials from '../data/credentials.json';

export const authService = {
  getCredentials() {
    return credentials;
  },

  async login(email, password) {
    console.log('AuthService: Checking credentials for:', email);
    const validCredentials = this.getCredentials();

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
  },

  async updatePassword(newPassword) {
    console.log('AuthService: Updating password');
    try {
      const credentials = this.getCredentials();
      credentials.password = newPassword;
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Failed to update password');
    }
  }
};

export default authService;