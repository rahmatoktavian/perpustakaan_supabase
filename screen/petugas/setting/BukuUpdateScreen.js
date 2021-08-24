import React, { Component } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, Button, TextInput, HelperText, Avatar, Portal, Modal, ActivityIndicator, } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { showMessage } from "react-native-flash-message";
import ValidationComponent from 'react-native-form-validator';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

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

        sampul: null,
        sampulURL: null,
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

      //get url image sampul
      let sampulURL = '';
      if(data.sampul != '') {
        const { signedURL } = await supabase
                                      .storage
                                      .from('hmd')
                                      .createSignedUrl('public/'+data.sampul, 60);
        sampulURL = signedURL;
      }

      this.setState({
                      kategori_id: data.kategori_id,
                      judul: data.judul,
                      stok: String(data.stok),

                      sampul: data.sampul,
                      sampulURL: sampulURL,
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

  async onOpenCamera() {
    //request akses kamera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showMessage({
        message: 'Akses kamera tidak diijinkan',
        type: 'danger',
        icon: 'danger',
      });

    } else {
      this.setState({isLoading:true});

      //buka kamera
      let fileImage = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      //jika close camera
      if (fileImage.cancelled) {
        this.setState({isLoading:false});

      //proses upload
      } else {

        //ambil nama file & ekstensi (jpg/png)
        let fileData = fileImage.uri.split('/');
        let fileName = fileData[(fileData.length-1)];
        let fileNameData = fileName.split('.');
        let fileNameExt = fileNameData[1];

        //upload image ke supabase storage
        const { data, error } = await supabase
                                .storage
                                .from('hmd')
                                .upload('public/'+fileName, decode(fileImage.base64), {
                                     contentType: 'image/'+fileNameExt
                                });

        //get url image sampul
        const { signedURL } = await supabase
                                      .storage
                                      .from('hmd')
                                      .createSignedUrl('public/'+fileName, 60);
        let sampulURL = signedURL;

        //respon
        if(error != null) {
          showMessage({
            message: error,
            type: 'danger',
            icon: 'danger',
          });
        } else {
          //update sampul di table buku
          let id = this.props.route.params.id;
          const { data } = await supabase
                                        .from('buku')
                                        .update([{
                                            sampul: fileName,
                                        }])
                                        .eq('id', id);

          showMessage({
            message: 'Gambar berhasil diupload',
            type: 'success',
            icon: 'success',
          });
        }

        this.setState({isLoading:false, sampulURL:sampulURL});
      }
      //end proses upload

    }

  }

  async onOpenGallery() {
    this.setState({isLoading:true});

    //request akses galeri
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showMessage({
        message: 'Akses galeri tidak diijinkan',
        type: 'danger',
        icon: 'danger',
      });

    } else {

      //buka galeri
      let fileImage = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      //jika close galeri
      if (fileImage.cancelled) {
        this.setState({isLoading:false});

      //proses upload
      } else {
      
        //ambil nama file & ekstensi (jpg/png)
        let fileData = fileImage.uri.split('/');
        let fileName = fileData[(fileData.length-1)];
        let fileNameData = fileName.split('.');
        let fileNameExt = fileNameData[1];

        //upload image ke supabase storage
        const { data, error } = await supabase
                                .storage
                                .from('hmd')
                                .upload('public/'+fileName, decode(fileImage.base64), {
                                     contentType: 'image/'+fileNameExt
                                })

        //get url image sampul
        const { signedURL } = await supabase
                                      .storage
                                      .from('hmd')
                                      .createSignedUrl('public/'+fileName, 60);
        let sampulURL = signedURL;

        //respon
        if(error != null) {
          showMessage({
            message: error,
            type: 'danger',
            icon: 'danger',
          });
        } else {
          //update sampul di table buku
          let id = this.props.route.params.id;
          const { data } = await supabase
                                        .from('buku')
                                        .update([{
                                            sampul: fileName,
                                        }])
                                        .eq('id', id);

          showMessage({
            message: 'Gambar berhasil diupload',
            type: 'success',
            icon: 'success',
          });
        }

        this.setState({isLoading:false, sampulURL:sampulURL});
      }
      //end proses upload
    }

  }

  onDeleteSampulConfirm() {
    Alert.alert(
      "Perhatian",
      "Gambar sampul akan dihapus",
      [
        { text: "Batal" },
        { text: "OK", onPress: () => this.onDeleteSampul() }
      ]
    );
  }

  async onDeleteSampul() {
      this.setState({isLoading:true});

      //ambil nama file
      let fileName = this.state.sampul;

      //upload image ke supabase storage
      const { data, error } = await supabase
                              .storage
                              .from('hmd')
                              .remove(['public/'+fileName]);

      if(error != null) {
        showMessage({
          message: error,
          type: 'danger',
          icon: 'danger',
        });
      } else {
        //update sampul di table buku
        let id = this.props.route.params.id;
        const { data } = await supabase
                                      .from('buku')
                                      .update([{
                                          sampul: null,
                                      }])
                                      .eq('id', id);

        showMessage({
          message: 'Gambar berhasil dihapus',
          type: 'success',
          icon: 'success',
        });
      }
      
      this.setState({isLoading:false, sampulURL:null});
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

            <View>
                <HelperText style={{marginHorizontal:10, marginTop:10}}>Sampul</HelperText>

                {this.state.sampulURL != null ?
                  <View style={{flex:1,alignItems:'center'}}>
                    <Avatar.Image size={100} source={{uri:this.state.sampulURL}} style={{marginLeft:10}} />
                    <Button icon="delete" mode="text" color="grey" onPress={() => this.onDeleteSampulConfirm()}>
                      Delete
                    </Button>
                  </View>
                  :
                  <View>
                    <Button icon="camera" mode="text" color={Theme.colors.primary} onPress={() => this.onOpenCamera()}>
                      Buka Kamera
                    </Button>

                    <Button icon="image" mode="text" color={Theme.colors.primary} onPress={() => this.onOpenGallery()}>
                      Upload Galeri
                    </Button>
                  </View>
                }

              </View>

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
