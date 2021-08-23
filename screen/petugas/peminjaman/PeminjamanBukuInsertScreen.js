import React, { Component } from 'react';
import { View, Alert } from 'react-native';
import { Provider as PaperProvider, Appbar, Button, TextInput, Portal, Modal, ActivityIndicator, HelperText, Divider} from 'react-native-paper';
import ValidationComponent from 'react-native-form-validator';
import { Picker } from '@react-native-picker/picker';
import { showMessage } from "react-native-flash-message";

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';

class PeminjamanBukuInsertScreen extends ValidationComponent {

  constructor(props) {
      super(props);

      this.state = {
        buku_data: [],
        peminjaman_id: this.props.route.params.peminjaman_id,
        buku_id: '',
        isLoading: false,
      };
  }

  componentDidMount() {
      this.getBukuData();
  }

  async getBukuData() {
    this.setState({isLoading:true});
    
    let { data, error } = await supabase
          .from('buku')
          .select('id, judul')

    //result
    this.setState({buku_data:data});

    this.setState({isLoading:false});
  }

  async onInsert() {
    this.validate({
      buku: {required:true},
      
    });

    if(this.isFormValid()) {
      this.setState({isLoading:true});

      //query data supabase
      const { data, error } = await supabase
                                    .from('peminjaman_buku')
                                    .insert([{
                                        buku_id: this.state.buku_id,
                                        peminjaman_id: this.state.peminjaman_id,
                                        buku_rusak: false,
                                        buku_hilang: false,
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

      this.props.navigation.navigate('PeminjamanBukuListScreen');
    } else {
      showMessage({
        message: this.getErrorMessages(),
        type: 'danger',
        icon: 'danger',
      });
    }
  }

  async onInsertTrans() {
      this.setState({isLoading:true});

      const { data:dataBuku } = await supabase
                                .from('buku')
                                .select('id, judul, stok')
                                .eq('id', this.state.buku_id)
                                .single()

      //query data supabase
      const { data:insertPeminjamanBuku } = await supabase
                                    .from('peminjaman_buku')
                                    .insert([{
                                        buku_id: this.state.buku_id,
                                        peminjaman_id: this.state.peminjaman_id,
                                        buku_rusak: false,
                                        buku_hilang: false,
                                    }])

      let stok = dataBuku.stok - 1;

      const { data:updateBuku, error } = await supabase
                                .from('buku')
                                .update([{
                                    stok: stok,
                                }])
                                .eq('id', this.state.buku_id)

      this.setState({isLoading:false});

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

      this.props.navigation.navigate('PeminjamanBukuListScreen');
      

  }

  

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Insert Peminjaman Buku" />
          </Appbar.Header>

          <HelperText style={{marginHorizontal:10, marginTop:10}}>Buku</HelperText>
            <Picker
              selectedValue={this.state.buku_id}
              onValueChange={(itemValue, itemIndex) => this.setState({buku_id:itemValue})}
              style={{margin:10}}
              mode='dropdown'
            >
              <Picker.Item label="Pilih Buku" value="" />
              {/*loop data state*/}
              {this.state.buku_data.map((row,key) => (
                <Picker.Item key={key} label={row.judul} value={row.id} />
              ))}
              {/*end loop*/}
            </Picker>
            <Divider style={{ marginHorizontal:10, marginBottom:10 }} />

          <Button
              mode="contained"
              icon="check"
              onPress={() => this.onInsert()}
              style={{margin:10}}
          >
            Simpan
          </Button>

          <Button
              mode="contained"
              icon="check"
              onPress={() => this.onInsertTrans()}
              style={{margin:10}}
          >
            Simpan Trans
          </Button>

          <Portal>
            <Modal visible={this.state.isLoading}>
              <ActivityIndicator abuku_idating={true} size="large" color={Theme.colors.primary} />
            </Modal>
          </Portal>
        </PaperProvider>
      )
  }
}

export default PeminjamanBukuInsertScreen;
