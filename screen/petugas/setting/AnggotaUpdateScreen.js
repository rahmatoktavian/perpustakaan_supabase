import React, { Component } from 'react';
import { View, Alert } from 'react-native';
import { Provider as PaperProvider, Appbar, Button, TextInput, Portal, Modal, ActivityIndicator, } from 'react-native-paper';
import { showMessage } from "react-native-flash-message";
import ValidationComponent from 'react-native-form-validator';

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';

class SupaAnggotaUpdateScreen extends ValidationComponent {

  constructor(props) {
      super(props);

      this.state = {
        nim: '',
        nama: '',
        jurusan: '',
        isLoading: false,
      };
  }

  componentDidMount() {
      this.getData();
  }

  async getData() {
      this.setState({isLoading:true});

      //parameter
      let nim = this.props.route.params.nim;

      //query data supabase
      const { data, error } = await supabase
                                    .from('anggota')
                                    .select('*')
                                    .eq('nim', nim)
                                    .single();

      this.setState({
                      nim: String(data.nim),
                      nama: data.nama,
                      jurusan: data.jurusan,
                      isLoading:false
                    });
  }

  //memanggil api untuk menyimpan data
  async onUpdate() {
    this.validate({
      nim: {required:true, numbers:true},
      nama: {required:true},
      jurusan: {required:true},
    });

    if(this.isFormValid()) {
      this.setState({isLoading:true});

      //parameter
      let nim = this.props.route.params.nim;

      //query supabase
      const { data, error } = await supabase
                                    .from('anggota')
                                    .update([{
                                        nama: this.state.nama,
                                        jurusan: this.state.jurusan,
                                    }])
                                    .eq('nim', nim)

      //menampilkan response erroe
      if(error != null) {
        showMessage({
          message: error.message,
          type: 'danger',
          icon: 'danger',
        });
      } else {
        showMessage({
          message: 'Data berhasil diubah',
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

  onDeleteConfirm() {
    Alert.alert(
      "Perhatian",
      "Data akan dihapus",
      [
        { text: "Batal" },
        { text: "OK", onPress: () => this.onDelete() }
      ]
    );
  }

  async onDelete() {
      this.setState({isLoading:true});

      //query supabase
      let nim = this.props.route.params.nim;
      const { data, error } = await supabase
                                    .from('anggota')
                                    .delete()
                                    .eq('nim', nim)

      //menampilkan response erroe
      if(error != null) {
        showMessage({
          message: error.message,
          type: 'danger',
          icon: 'danger',
        });
      } else {
        showMessage({
          message: 'Data berhasil dihapus',
          type: 'success',
          icon: 'success',
        });
      }

      this.setState({isLoading:false});
      this.props.navigation.navigate('SupaAnggotaListScreen');
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Update Anggota" />
            <Appbar.Action icon="delete" onPress={() => this.onDeleteConfirm()} />
          </Appbar.Header>

          <TextInput
            label="NIM"
            value={this.state.nim}
            onChangeText={text => this.setState({nim:text})}
            keyboardType="numeric"
            disabled={true}
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
              onPress={() => this.onUpdate()}
              style={{margin:10}}
          >
            Simpan
          </Button>

          <Loading isLoading={this.state.isLoading} />
        </PaperProvider>
      )
  }
}

export default SupaAnggotaUpdateScreen;
