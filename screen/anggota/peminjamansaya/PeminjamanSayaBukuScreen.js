import React, { Component } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Provider as PaperProvider, List, Appbar, Portal, Modal, ActivityIndicator, Button, } from 'react-native-paper';

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';

class PeminjamanSayaBukuScreen extends Component {

  constructor(props) {
      super(props);

      //default value
      this.state = {
        //menangkap data dari peminjaman saya
        peminjaman_id: this.props.route.params.peminjaman_id,
        nama: this.props.route.params.nama,
        tanggal_pinjam: this.props.route.params.tanggal_pinjam,

        data: [],
        isLoading: false,
      };
  }

  componentDidMount() {
      this._unsubscribe = this.props.navigation.addListener('focus', () => {
        this.getData();
      });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  async getData() {
      this.setState({isLoading:true});

      //query supabase
      const { data, error } = await supabase
                            .from('peminjaman_buku')
                            .select('*, buku:buku_id(judul)')
                            .eq('peminjaman_id', this.state.peminjaman_id)

      //memasukan respon ke state untuk loop data di render
      this.setState({data:data, isLoading:false});
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Peminjaman Buku" />
          </Appbar.Header>

          <List.Item
            key={0}
            title={this.state.nama}
            description={'Tgl Pinjam: '+this.state.tanggal_pinjam}
            left={props => <List.Icon icon="account" />}
          />

          <ScrollView>
          <List.Section title="Buku">
              {/*loop data state*/}
              {this.state.data && this.state.data.map((row,key) => (
                <List.Item
                  key={key}
                  title={row.buku.judul}
                  left={props => <List.Icon icon="book" />}
                />
              ))}
              {/*end loop*/}
          </List.Section>
          </ScrollView>

          <Loading isLoading={this.state.isLoading} />

        </PaperProvider>
      )
  }
}

export default PeminjamanSayaBukuScreen;
