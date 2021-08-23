import React, { Component } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, Button, TextInput, Portal, Modal, ActivityIndicator, HelperText } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { showMessage } from "react-native-flash-message";
import ValidationComponent from 'react-native-form-validator';

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';

class SupaBukuInsertScreen extends ValidationComponent {

  constructor(props) {
      super(props);

      this.state = {
        kategori_buku_data: [],

        kategori_id: '',
        judul: '',
        stok: '',
        isLoading: false,
      };
  }

  componentDidMount() {
      this.getKategoriData();
  }

  async getKategoriData() {
      this.setState({isLoading:true});

      //query data supabase
      const { data, error } = await supabase
                                    .from('kategori_buku')
                                    .select('*')
                                    .order('nama', {ascending:true})
  
      //memasukan respon ke state untuk loop data di render
      this.setState({kategori_buku_data:data, isLoading:false});
  }

  //memanggil api untuk menyimpan data
  async onInsert() {
    this.validate({
      kategori_id: {required:true},
      judul: {required:true},
      stok: {required:true, numbers:true},
    });

    if(this.isFormValid()) {
      this.setState({isLoading:true});

      //query data supabase
      const { data, error } = await supabase
                                    .from('buku')
                                    .insert([{
                                        kategori_id: this.state.kategori_id,
                                        judul: this.state.judul,
                                        stok: this.state.stok,
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
      this.props.navigation.navigate('SupaBukuListScreen');
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
            <HelperText style={{marginHorizontal:10, marginTop:10}}>Kategori</HelperText>
            <Picker
              selectedValue={this.state.kategori_id}
              onValueChange={(itemValue, itemIndex) => this.setState({kategori_id:itemValue})}
              style={{margin:10}}
              mode='dropdown'
            >
              <Picker.Item label="Pilih Kategori" value="" />
              {/*loop data state*/}
              {this.state.kategori_buku_data.map((row,key) => (
                <Picker.Item key={key} label={row.nama} value={row.id} />
              ))}
              {/*end loop*/}
            </Picker>

            <TextInput
              label="Judul"
              value={this.state.judul}
              onChangeText={text => this.setState({judul:text})}
              style={{margin:10}}
            />

            <TextInput
              label="Stok"
              value={this.state.stok}
              onChangeText={text => this.setState({stok:text})}
              keyboardType="numeric"
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
          </ScrollView>

          <Portal>
            <Modal visible={this.state.isLoading}>
              <ActivityIndicator akategori_idating={true} size="large" color={Theme.colors.primary} />
            </Modal>
          </Portal>
        </PaperProvider>
      )
  }
}

export default SupaBukuInsertScreen;
