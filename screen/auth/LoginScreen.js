import React, { Component } from 'react';
import { View, Alert } from 'react-native';
import { Provider as PaperProvider, Appbar, Button, TextInput, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { showMessage } from "react-native-flash-message";
import ValidationComponent from 'react-native-form-validator';
import AsyncStorage from '@react-native-async-storage/async-storage';

import supabase from '../../config/supabase';
import Theme from '../../config/Theme';
import storeApp from '../../config/storeApp';
import Loading from '../../component/Loading';

class LoginScreen extends ValidationComponent {

  constructor(props) {
      super(props);

      //redux variable
      this.state = storeApp.getState();
      storeApp.subscribe(()=>{
        this.setState(storeApp.getState());
      });

      //default state value
      this.state = {
        ...this.state,
        email: '',
        password: '',
        isLoading: false,
      };
  }

  componentDidMount() {
    //memanggil fungsi email & password yg tersimpan
    this.defaultValue();
  }

  //menampilkan email & password yg tersimpan
  async defaultValue() {
    let loginEmail = await AsyncStorage.getItem('@loginEmail');
    let loginPassword = await AsyncStorage.getItem('@loginPassword');

    this.setState({ email:loginEmail, password:loginPassword });
  }

  //memanggil api untuk menyimpan data
  async onLogin() {
    this.validate({
      email: {required:true, email:true},
      password: {required:true},
    });

    //validasi email & password benar
    if(this.isFormValid()) {
      this.setState({isLoading:true});

      //simpan email & password yg di submit
      await AsyncStorage.setItem('@loginEmail', this.state.email);
      await AsyncStorage.setItem('@loginPassword', this.state.password);

      //check login supabase
      const { user, session, error } = await supabase.auth.signIn({
  			email: this.state.email,
				password: this.state.password,
			})

      //jika login valid
      if(user != null) {
        showMessage({
          message: 'Berhasil login',
          type: 'success',
          icon: 'success'
        });

        //query table user
        const { data, error } = await supabase
                                      .from('users')
                                      .select('*')
                                      .eq('id', user.id)
                                      .single()
        //update redux
        storeApp.dispatch({
            type: 'LOGIN',
            payload: { isLogin:true, user_type:data.type, nim:data.nim, petugas_id:data.petugas_id }
        });

      //jika login tidak valid
      } else {
        showMessage({
          message: error.message,
          type: 'danger',
          icon: 'danger'
        });
      }

      this.setState({isLoading:false});

    //validasi email & password salah
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
            <Appbar.Content title="Login" />
          </Appbar.Header>

          <TextInput
            label="Email"
            value={this.state.email}
            onChangeText={text => this.setState({email:text})}
            style={{marginHorizontal:10}}
          />

          <TextInput
            label="Password"
            value={this.state.password}
            onChangeText={text => this.setState({password:text})}
            secureTextEntry={true}
            style={{marginHorizontal:10}}
          />

          <Button
              mode="contained"
              icon="login"
              onPress={() => this.onLogin()}
              style={{margin:10}}
          >
            Login
          </Button>

          <Button
              mode="outlined"
              icon="login"
              onPress={() => this.props.navigation.navigate('RegisterAnggotaScreen')}
              style={{margin:10}}
          >
            Register Anggota
          </Button>

          <Loading isLoading={this.state.isLoading} />
        </PaperProvider>
      )
  }
}

export default LoginScreen;
