import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, List, Portal, Modal, ActivityIndicator, Button, IconButton } from 'react-native-paper';

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import storeApp from '../../../config/storeApp';

import dateFormatDB from '../../../component/dateFormatDB';
import Loading from '../../../component/Loading';

class PeminjamanSayaScreen extends Component {

  constructor(props) {
      super(props);

      //get redux variable
      this.state = storeApp.getState();
      storeApp.subscribe(()=>{
        this.setState(storeApp.getState());
      });

      this.state = {
        ...this.state,
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
                            .from('peminjaman')
                            .select('*, anggota:nim(nama), petugas:petugas_id(nama)')
                            .eq('nim', this.state.nim)
                            .order('tanggal_pinjam', {ascending:true})

      //memasukan respon ke state untuk loop data di render
      this.setState({data:data, isLoading:false});
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Content title="Peminjaman Saya" />
          </Appbar.Header>

          <ScrollView>
          <List.Section>
              {/*loop data state*/}
              {this.state.data && this.state.data.map((row,key) => (
                <List.Item
                  key={key}
                  title={dateFormatDB(row.tanggal_pinjam)}
                  description={'Batas Kembali: '+dateFormatDB(row.tanggal_batas_kembali)+' \nPetugas: '+row.petugas.nama}
                  right={props => <List.Icon icon="book" />}
                  onPress={() => this.props.navigation.navigate('PeminjamanSayaBukuScreen', {peminjaman_id: row.id, nama: row.anggota.nama, tanggal_pinjam: row.tanggal_pinjam})}
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

export default PeminjamanSayaScreen;
