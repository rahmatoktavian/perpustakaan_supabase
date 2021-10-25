import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, Avatar, List, Button, IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { showMessage } from "react-native-flash-message";

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';

class OngkirScreen extends Component {

  constructor(props) {
      super(props);

      this.state = {
        list_kota: [],
        asal_kota_id: '',
        tujuan_kota_id: '',
        isLoading: false,
      };
  }

  componentDidMount() {
      this.getKota();
  }

  async getKota() {
    this.setState({isLoading:true});

    fetch('https://api.rajaongkir.com/starter/city',
      {
         method: 'GET', 
         headers: { 'key': '8d923ad9ac9eb0ff0349a6885122d1f3' },
      }
    )
    .then((response) => response.json())
    .then((json) => {
        console.log(json.rajaongkir.results);
        this.setState({list_kota:json.rajaongkir.results});
        this.setState({isLoading:false});
    })
    .catch((error) => console.error(error));
  }

  onCekOngkir() {
    let asal_kota_id = this.state.asal_kota_id;
    let tujuan_kota_id = this.state.tujuan_kota_id;
    alert(tujuan_kota_id)
    //api
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Ongkir" />
          </Appbar.Header>

          <ScrollView>
          <Picker
            selectedValue={this.state.asal_kota_id}
            onValueChange={(itemValue, itemIndex) => this.setState({asal_kota_id:itemValue})}
            style={{margin:10}}
            mode='dropdown'
          >
            <Picker.Item label="Pilih Kota Asal" value="" />
            {/*loop data state*/}
            {this.state.list_kota.map((row,key) => (
              <Picker.Item key={key} label={row.city_name} value={row.city_id} />
            ))}
            {/*end loop*/}
          </Picker>

          <Picker
            selectedValue={this.state.tujuan_kota_id}
            onValueChange={(itemValue, itemIndex) => this.setState({tujuan_kota_id:itemValue})}
            style={{margin:10}}
            mode='dropdown'
          >
            <Picker.Item label="Pilih Kota Tujuan" value="" />
            {/*loop data state*/}
            {this.state.list_kota.map((row,key) => (
              <Picker.Item key={key} label={row.city_name} value={row.city_id} />
            ))}
            {/*end loop*/}
          </Picker>
          </ScrollView>

          <Button
              mode="contained"
              icon="magnify"
              onPress={() => this.onCekOngkir()}
              style={{margin:20}}
          >
            Cek Ongkir
          </Button>

          <Loading isLoading={this.state.isLoading} />
        </PaperProvider>
      )
  }
}

export default OngkirScreen;
