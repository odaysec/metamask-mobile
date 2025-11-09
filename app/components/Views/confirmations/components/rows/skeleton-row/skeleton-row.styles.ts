import { StyleSheet } from 'react-native';
import { Theme } from '../../../../../../util/theme/models';

const styleSheet = (_params: { theme: Theme }) =>
  StyleSheet.create({
    container: {
      marginBottom: 14,
    },

    skeleton: {
      borderRadius: 8,
    },
  });

export default styleSheet;
