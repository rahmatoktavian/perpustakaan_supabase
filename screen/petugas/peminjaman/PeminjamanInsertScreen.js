import React, { Component } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, Button, TextInput, Portal, Modal, ActivityIndicator, HelperText } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { showMessage } from "react-native-flash-message";
import ValidationComponent from 'react-native-form-validator';

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import storeApp from '../../../config/storeApp';
import dateFormat from '../../../component/dateFormat';
import Loading from '../../../component/Loading';

class PeminjamanInsertScreen extends ValidationComponent {

  constructor(props) {
      super(props);

      //get redux variable
      this.state = storeApp.getState();
      storeApp.subscribe(()=>{
        this.setState(storeApp.getState());
      });

      this.state = {
        ...this.state,
        anggota: [],
        nim: '',
        isLoading: false,
      };
  }

  componentDidMount() {
      this.getAnggotaData();
  }

  async getAnggotaData() {
    this.setState({isLoading:true});

    let { data, error } = await supabase
          .from('anggota')
          .select('nama, nim')
          .order('nama', {ascending:true})

    //result
    this.setState({anggota:data, isLoading:false});
  }

  //memanggil api untuk menyimpan data
  async onInsert() {
    this.validate({
      nim: {required:true},
    });

    if(this.isFormValid()) {
      this.setState({isLoading:true});

      let nim = this.state.nim;
      let tanggal_pinjam = dateFormat(new Date());

      let currDate = new Date();
      currDate.setDate(currDate.getDate() + 7);
      let tanggal_batas_kembali = dateFormat(currDate);

      //query data supabase
      const { data, error } = await supabase
                                    .from('peminjaman')
                                    .insert([{
                                        nim: nim,
                                        petugas_id: this.state.petugas_id,
                                        tanggal_pinjam: tanggal_pinjam,
                                        tanggal_batas_kembali: tanggal_batas_kembali,
                                    }])

      this.setState({isLoading:false});

      //menampilkan response erroe
      if(error != null) {
        showMessage({
          message: error.message,
          type: 'danger',
          icon: 'danger',
        });
      } else {
        showMessage({
          message: 'Data berhasil ditambah',
          type: 'success',
          icon: 'success',
        });
      }

      this.props.navigation.navigate('PeminjamanListScreen');
    } else {
      showMessage({
        message: this.getErrorMessages(),
        type: 'danger',
        icon: 'danger',
      });
    }
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Insert Buku" />
          </Appbar.Header>

          <ScrollView>
            <HelperText style={{marginHorizontal:10, marginTop:10}}>Anggota</HelperText>

            <Picker
              selectedValue={this.state.nim}
              onValueChange={(itemValue, itemIndex) => this.setState({nim:itemValue})}
              style={{margin:10}}
              mode='dropdown'
            >
              <Picker.Item label="Pilih Anggota" value="" />
              {/*loop data state*/}
              {this.state.anggota.map((row,key) => (
                <Picker.Item key={key} label={row.nama} value={row.nim} />
              ))}
              {/*end loop*/}
            </Picker>

            <Button
                mode="contained"
                icon="check"
                onPress={() => this.onInsert()}
                style={{margin:10}}
            >
              Simpan
            </Button>
          </ScrollView>

          <Loading isLoading={this.state.isLoading} />

        </PaperProvider>
      )
  }
}

export default PeminjamanInsertScreen;
