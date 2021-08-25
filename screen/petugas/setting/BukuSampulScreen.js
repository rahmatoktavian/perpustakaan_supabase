import React, { Component } from 'react';
import { View, Alert, ScrollView, Image } from 'react-native';
import { Provider as PaperProvider, Appbar, Button, Portal, Modal, TouchableRipple, ActivityIndicator, } from 'react-native-paper';
import { showMessage } from "react-native-flash-message";
import ValidationComponent from 'react-native-form-validator';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';

class BukuSampulScreen extends ValidationComponent {

  constructor(props) {
      super(props);

      this.state = {
        sampul: null,
        sampulURL: null,
        isLoading: false,
      };
  }

  componentDidMount() {
      this.getData();
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
                                      .createSignedUrl('buku/'+data.sampul, 60);
        sampulURL = signedURL;
      }

      this.setState({
                      judul: data.judul,
                      sampul: data.sampul,
                      sampulURL: sampulURL,
                      isLoading:false
                    });
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
                                .upload('buku/'+fileName, decode(fileImage.base64), {
                                     contentType: 'image/'+fileNameExt
                                });

        //get url image sampul
        const { signedURL } = await supabase
                                      .storage
                                      .from('hmd')
                                      .createSignedUrl('buku/'+fileName, 60);
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
                                .upload('buku/'+fileName, decode(fileImage.base64), {
                                     contentType: 'image/'+fileNameExt
                                })

        //get url image sampul
        const { signedURL } = await supabase
                                      .storage
                                      .from('hmd')
                                      .createSignedUrl('buku/'+fileName, 60);
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

      //hapus
      const { data, error } = await supabase
                              .storage
                              .from('hmd')
                              .remove(['buku/'+fileName]);

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
            <Appbar.Content title="Sampul Buku" subtitle={this.state.judul} />
          </Appbar.Header>

          <ScrollView>

            {this.state.sampulURL != null ?
              <View style={{flex:1,alignItems:'center'}}>
                <TouchableRipple onPress={() => this.setState({displaySampul:true})}>
                  <Image source={{uri:this.state.sampulURL}} style={{width:180, height:250, margin:20}} />
                </TouchableRipple>

                <Button icon="delete" mode="outlined" color="grey" onPress={() => this.onDeleteSampulConfirm()} style={{margin:10}}>
                  Delete
                </Button>
              </View>
              :
              <View>
                <Button icon="camera" mode="contained" color={Theme.colors.primary} onPress={() => this.onOpenCamera()} style={{margin:10}}>
                  Buka Kamera
                </Button>

                <Button icon="image" mode="contained" color={Theme.colors.primary} onPress={() => this.onOpenGallery()} style={{margin:10}}>
                  Upload Galeri
                </Button>
              </View>
            }

          </ScrollView>

          <Portal>
            <Modal visible={this.state.displaySampul} onDismiss={() => this.setState({displaySampul:false})} contentContainerStyle={{justifyContent:'center',alignItems:'center'}}>
              <Image source={{uri:this.state.sampulURL}} style={{width:300, height:500}} />
            </Modal>
          </Portal>

          <Portal>
            <Modal visible={this.state.isLoading}>
              <ActivityIndicator akategori_idating={true} size="large" color={Theme.colors.primary} />
            </Modal>
          </Portal>
        </PaperProvider>
      )
  }
}

export default BukuSampulScreen;
