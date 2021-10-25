import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, List, Portal, Modal, ActivityIndicator, IconButton, Button, } from 'react-native-paper';
import { showMessage } from "react-native-flash-message";

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading'; 

class AnggotaListScreen extends Component {

  constructor(props) {
      super(props);

      this.state = {
        data: [],
        isLoading: false,
      };
  }

  componentDidMount() {
      this.getData();

      this._unsubscribe = this.props.navigation.addListener('focus', () => {
        this.getData();
      });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  async getData() {
      this.setState({isLoading:true});

      //query data supabase
      const { data, error } = await supabase
                                    .from('anggota')
                                    .select('*')
                                    .order('nama', {ascending:true})

      //memasukan respon ke state untuk loop data di render
      this.setState({data:data, isLoading:false});
  }

  onSendWA() {
    this.setState({isLoading:true});

    fetch('https://console.zenziva.net/wareguler/api/sendWA/',
      {
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           'userkey': '057eaa734f70',
           'passkey' : '85a0025dd95930c35959a977',
           'to' : '085691357671',
           'message' : 'Pesan dari RN'
         }), 
      }
    )
    .then((response) => response.json())
    .then((json) => {
        console.log(json);

        if(json.text === 'Success') {
          showMessage({
            message: 'Berhasil kirim pesan',
            type: 'success',
            icon: 'success',
          });
        } else {
          showMessage({
            message: json.text,
            type: 'danger',
            icon: 'danger',
          });
        }  
        this.setState({isLoading:false});
      
    })
    .catch((error) => {
      console.error(error)
      this.setState({isLoading:false});
    });
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Anggota" />
          </Appbar.Header>

          <ScrollView>
          <List.Section>
              {/*loop data state*/}
              {this.state.data && this.state.data.map((row,key) => (
                <List.Item
                  key={key}
                  title={row.nama}
                  description={'NIM : '+row.nim}
                  right={props => 
                                  <>
                                  <IconButton icon="whatsapp" onPress={() => this.onSendWA()} />
                                  <IconButton icon="pencil" onPress={() => this.props.navigation.navigate('AnggotaUpdateScreen', {nim: row.nim})} />
                                  </>}
                  
                />
              ))}
              {/*end loop*/}
          </List.Section>
          </ScrollView>

          <Button
              mode="contained"
              icon="plus"
              onPress={() => this.props.navigation.navigate('AnggotaInsertScreen')}
              style={{margin:20}}
          >
            Insert Anggota
          </Button>

          <Loading isLoading={this.state.isLoading} />
        </PaperProvider>
      )
  }
}

export default AnggotaListScreen;
