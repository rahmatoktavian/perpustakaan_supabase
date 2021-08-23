import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, List, Portal, Modal, ActivityIndicator, Button, } from 'react-native-paper';

import Theme from '../../../config/Theme';

class SettingScreen extends Component {

  constructor(props) {
      super(props);
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Content title="Setting" />
          </Appbar.Header>

          <ScrollView>
          <List.Section>
              <List.Item
                key={0}
                title="Anggota"
                left={props => <List.Icon icon="account" />}
                right={props => <List.Icon icon="arrow-right" />}
                onPress={() => this.props.navigation.navigate('AnggotaListScreen')}
              />
              <List.Item
                key={1}
                title="Buku"
                left={props => <List.Icon icon="book" />}
                right={props => <List.Icon icon="arrow-right" />}
                onPress={() => this.props.navigation.navigate('BukuListScreen')}
              />

          </List.Section>
          </ScrollView>

        </PaperProvider>
      )
  }
}

export default SettingScreen;