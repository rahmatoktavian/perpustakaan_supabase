import React, { Component } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, Button, TextInput, HelperText, ActivityIndicator } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { showMessage } from "react-native-flash-message";
import ValidationComponent from 'react-native-form-validator';
import supabase from '../../config/supabase.js';

import Theme from '../../config/Theme';
import storeApp from '../../config/storeApp';
import Loading from '../../component/Loading';

class RegisterAnggotaScreen extends ValidationComponent {

  constructor(props) {
      super(props);

      //redux variable
      this.state = storeApp.getState();
      storeApp.subscribe(()=>{
        this.setState(storeApp.getState());
      });

      this.state = {
        ...this.state,
        email: '',
        password: '',
        nim: '',
        nama: '',
        jurusan: '',

        jurusanList: [],
        isLoading: false,
        registerSuccess: false,
      };
  }

  componentDidMount() {

  }


  async onRegister() {
    this.validate({
      email: {required:true},
      password: {required:true, minlength:6},
      nim: {required:true, numeric:true},
      nama: {required:true},
      jurusan: {required:true},
    });

    if(this.isFormValid()) {
        this.setState({isLoading:true});

        const email = this.state.email;
        const password = this.state.password;
        const nim = this.state.nim;
        const nama = this.state.nama;
        const jurusan = this.state.jurusan;

        //signup
        const { user, session, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        //if register error
        if(error) {
              showMessage({
                message: error.message,
                icon: 'warning',
                backgroundColor: 'red',
                color: Theme.colors.background,
              });

        //register succeed
        } else {
              const uid = user.id;

              //insert user
              const insertUser = await supabase
                                    .from('users')
                                    .insert([
                                      {
                                        id: uid,
                                        type: 'anggota',
                                        petugas_id: null,
                                        nim: nim,
                                      }
                                    ]);

              //insert anggota
              const insertAnggota = await supabase
                                    .from('anggota')
                                    .insert([
                                      {
                                        nim: nim,
                                        nama: nama,
                                        jurusan: jurusan,
                                      }
                                    ]);
            showMessage({
              message: "Data berhasil disimpan",
              icon: 'success',
              type: 'success'
            });

            this.props.navigation.navigate('LoginScreen');

          }

          this.setState({isLoading:false});

    }
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Register Anggota" />
          </Appbar.Header>

          <ScrollView>
          <TextInput
            label="Email"
            value={this.state.email}
            onChangeText={text => this.setState({email:text})}
            style={{marginHorizontal:10}}
          />
          {this.isFieldInError('email') && this.getErrorsInField('email').map(errorMessage => <HelperText type="error">{errorMessage}</HelperText>) }

          <TextInput
            label="Password"
            value={this.state.password}
            onChangeText={text => this.setState({password:text})}
            secureTextEntry={true}
            style={{marginHorizontal:10}}
          />
          {this.isFieldInError('password') && this.getErrorsInField('password').map(errorMessage => <HelperText type="error">{errorMessage}</HelperText>) }

          <TextInput
            label="NIM"
            value={this.state.nim}
            onChangeText={text => this.setState({nim:text})}
            style={{marginHorizontal:10}}
          />
          {this.isFieldInError('nim') && this.getErrorsInField('nim').map(errorMessage => <HelperText type="error">{errorMessage}</HelperText>) }

          <TextInput
            label="Nama"
            value={this.state.nama}
            onChangeText={text => this.setState({nama:text})}
            style={{marginHorizontal:10}}
          />
          {this.isFieldInError('nama') && this.getErrorsInField('nama').map(errorMessage => <HelperText type="error">{errorMessage}</HelperText>) }

          <TextInput
            label="Jurusan"
            value={this.state.jurusan}
            onChangeText={text => this.setState({jurusan:text})}
            style={{marginHorizontal:10}}
          />
          {this.isFieldInError('jurusan') && this.getErrorsInField('jurusan').map(errorMessage => <HelperText type="error">{errorMessage}</HelperText>) }

          <Button
              mode="contained"
              icon="check"
              onPress={() => this.onRegister()}
              style={{margin:10}}
          >
            Register
          </Button>
          </ScrollView>

          <Loading isLoading={this.state.isLoading} />
        </PaperProvider>
      )
  }
}

export default RegisterAnggotaScreen;
