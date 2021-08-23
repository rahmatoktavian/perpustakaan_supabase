import React, { Component } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Provider as PaperProvider, Appbar, Button, TextInput, Portal, Modal, ActivityIndicator, } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { showMessage } from "react-native-flash-message";

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';

class PeminjamanBukuInsertBarcodeScreen extends Component {

  constructor(props) {
      super(props);

      this.state = {
        buku_data: [],

        peminjaman_id: this.props.route.params.peminjaman_id,
        buku_id: '',
        isLoading: false,

        barcodeDisplay: false,
        barcodePermit: '',
        barcodeNumber: '',
      };
  }

  componentDidMount() {
      this.barcodeReqPermit();
  }

  async barcodeReqPermit() {
    this.setState({isLoading:true, barcodeDisplay:true});

    const { status } = await BarCodeScanner.requestPermissionsAsync();
    this.setState({barcodePermit:status});

    this.setState({isLoading:false});
  }

  //memanggil api untuk menyimpan data
  async onInsertTrans(barcode) { 
      this.setState({isLoading:true, barcodeDisplay:false});
      
      const { data:dataBuku } = await supabase
                                .from('buku')
                                .select('id, judul, stok')
                                .eq('barcode', barcode)
                                .single();
                                console.log(dataBuku.id)

      let buku_id = dataBuku.id;
      let stok = dataBuku.stok - 1;

      const { data:updateBuku } = await supabase
                                .from('buku')
                                .update([{
                                    stok: stok,
                                }])
                                .eq('id', buku_id)


      const { data, error } = await supabase
                                    .from('peminjaman_buku')
                                    .insert([{
                                        buku_id: buku_id,
                                        peminjaman_id: this.state.peminjaman_id,
                                        buku_rusak: false,
                                        buku_hilang: false,
                                    }])
  
      

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
      this.props.navigation.navigate('PeminjamanBukuListScreen');
    
  }


  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Insert Peminjaman Buku" />
          </Appbar.Header>

          {(this.state.barcodePermit == 'granted' && this.state.barcodeDisplay == true)  &&
              <BarCodeScanner
                onBarCodeScanned={({type, data}) => this.onInsertTrans(data)}
                style={StyleSheet.absoluteFillObject}
              />
          }

          <Portal>
            <Modal visible={this.state.isLoading}>
              <ActivityIndicator abuku_idating={true} size="large" color={Theme.colors.primary} />
            </Modal>
          </Portal>
        </PaperProvider>
      )
  }
}

export default PeminjamanBukuInsertBarcodeScreen;
