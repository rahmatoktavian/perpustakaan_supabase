import React, { Component } from 'react';
import { View, Alert } from 'react-native';
import { Provider as PaperProvider, Appbar, Button, TextInput, Portal, Modal, ActivityIndicator, HelperText } from 'react-native-paper';
import { showMessage } from "react-native-flash-message";
import ValidationComponent from 'react-native-form-validator';

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';

class SupaAnggotaInsertScreen extends ValidationComponent {

  constructor(props) {
      super(props);

      this.state = {
        nim: '',
        nama: '',
        jurusan: '',
        isLoading: false,

        displayDateTimePicker: false,
        tanggal: new Date(),
      };
  }

  //memanggil api untuk menyimpan data
  async onInsert() {
    this.validate({
      nim: {required:true, numbers:true},
      nama: {required:true},
      jurusan: {required:true},
    });

    if(this.isFormValid()) {
      this.setState({isLoading:true});

      //query data supabase
      const { data, error } = await supabase
                                    .from('anggota')
                                    .insert([{
                                        nim: this.state.nim,
                                        nama: this.state.nama,
                                        jurusan: this.state.jurusan,
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
      
      this.setState({isLoading:false});
      this.props.navigation.navigate('SupaAnggotaListScreen');

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
            <Appbar.Content title="Insert Anggota" />
          </Appbar.Header>

          <TextInput
            label="NIM"
            value={this.state.nim}
            onChangeText={text => this.setState({nim:text})}
            keyboardType="numeric"
            style={{margin:10}}
          />

          <TextInput
            label="Nama"
            value={this.state.nama}
            onChangeText={text => this.setState({nama:text})}
            style={{margin:10}}
          />

          <TextInput
            label="Jurusan"
            value={this.state.jurusan}
            onChangeText={text => this.setState({jurusan:text})}
            style={{margin:10}}
          />
          
          <Button
              mode="contained"
              icon="check"
              onPress={() => this.onInsert()}
              style={{margin:10}}
          >
            Simpan
          </Button>

          <Loading isLoading={this.state.isLoading} />
        </PaperProvider>
      )
  }
}

export default SupaAnggotaInsertScreen;
