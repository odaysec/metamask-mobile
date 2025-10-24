module.exports = {
  name: 'MetaMask',
  displayName: 'MetaMask',
  experiments: {
    reactCompiler: {
      enabled: true,
    },
  },
  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          extraMavenRepos: [
            '../../node_modules/@notifee/react-native/android/libs',
          ],
        },
        ios: {},
      },
    ],
    [
      '@config-plugins/detox',
      {
        subdomains: '*',
      },
    ],

    'expo-apple-authentication',
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Geist-Regular.otf',
          './assets/fonts/Geist-Medium.otf',
          './assets/fonts/Geist-Bold.otf',
          './assets/fonts/Geist-Regular-Italic.otf',
          './assets/fonts/Geist-Medium-Italic.otf',
          './assets/fonts/Geist-Bold-Italic.otf',
          './assets/fonts/MMSans-Regular.otf',
          './assets/fonts/MMSans-Medium.otf',
          './assets/fonts/MMSans-Bold.otf',
          './assets/fonts/MMPoly-Regular.otf',
        ],
      },
    ],
  ],
  android: {
    package:
      process.env.METAMASK_BUILD_TYPE === 'flask'
        ? 'io.metamask.flask'
        : 'io.metamask', // Required for @expo/repack-app Android repacking
  },
  ios: {
    bundleIdentifier: 'io.metamask.MetaMask',
    usesAppleSignIn: true,
  },
};
