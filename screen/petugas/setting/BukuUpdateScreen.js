import React, { Component } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, Button, TextInput, HelperText, Portal, Modal, ActivityIndicator, } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { showMessage } from "react-native-flash-message";
import ValidationComponent from 'react-native-form-validator';

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';

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
      this.getData();
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

  async getData() {
      this.setState({isLoading:true});

      //parameter
      let id = this.props.route.params.id;

      //query data supabase
      const { data, error } = await supabase
                                    .from('buku')
                                    .select('*')
                                    .eq('id', id)
                                    .single();

      this.setState({
                      kategori_id: data.kategori_id,
                      judul: data.judul,
                      stok: String(data.stok),
                      isLoading:false
                    });
  }

  //memanggil api untuk menyimpan data
  async onUpdate() {
    this.validate({
      kategori_id: {required:true},
      judul: {required:true},
      stok: {required:true, numbers:true},
    });

    if(this.isFormValid()) {
      this.setState({isLoading:true});

      //parameter
      let id = this.props.route.params.id;

      //query supabase
      const { data, error } = await supabase
                                    .from('buku')
                                    .update([{
                                        kategori_id: this.state.kategori_id,
                                        judul: this.state.judul,
                                        stok: this.state.stok,
                                    }])
                                    .eq('id', id)
      
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
      this.props.navigation.navigate('SupaBukuListScreen');
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
      let id = this.props.route.params.id;
      const { data, error } = await supabase
                                    .from('buku')
                                    .delete()
                                    .eq('id', id)

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
      this.props.navigation.navigate('SupaBukuListScreen');
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Update Buku" />
            <Appbar.Action icon="delete" onPress={() => this.onDeleteConfirm()} />
          </Appbar.Header>

          <ScrollView>
            <HelperText style={{marginHorizontal:10, marginTop:10}}>Kategori</HelperText>
            <Picker
              selectedValue={this.state.kategori_id}
              onValueChange={(itemValue, itemIndex) => this.setState({kategori_id:itemValue})}
              style={{marginHorizontal:10}}
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
                onPress={() => this.onUpdate()}
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
