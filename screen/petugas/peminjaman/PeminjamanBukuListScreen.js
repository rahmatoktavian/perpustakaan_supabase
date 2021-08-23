import React, { Component } from 'react';
import { View, ScrollView, Alert, FlatList } from 'react-native';
import { Provider as PaperProvider, List, Appbar, Portal, Modal, ActivityIndicator, Button, Divider} from 'react-native-paper';
import { showMessage } from "react-native-flash-message";

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';
import dateFormatDB from '../../../component/dateFormatDB';

class PeminjamanBukuListScreen extends Component {

  constructor(props) {
      super(props);

      this.state = {
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

      //query table user
      const { data, error } = await supabase
                                .from('peminjaman_buku')
                                .select('id, buku:buku_id (judul), buku_rusak, buku_hilang')
                                .eq('peminjaman_id', this.state.peminjaman_id)

      this.setState({data:data, isLoading:false});
  }

  onDeleteConfirm(id) {
    Alert.alert(
      "Perhatian",
      "Data akan dihapus",
      [
        { text: "Batal" },
        { text: "OK", onPress: () => this.onDelete(id) }
      ]
    );
  }

  async onDelete(id) {
    this.setState({isLoading:true});

    let response = await supabase
          .from('peminjaman_buku')
          .delete()
          .eq('id', id);

    //notif
    if(response.error) {
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
      this.getData();

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
            description={'Tgl Pinjam: '+dateFormatDB(this.state.tanggal_pinjam)}
            left={props => <List.Icon icon="account" />}
          />

          <ScrollView>
          <List.Section>
            {/*loop data state*/}
            {this.state.data && this.state.data.map((row,key) => (
              <List.Item
                title={row.buku.judul}
                left={props => <List.Icon icon="book" />}
                right={props => <List.Icon icon="trash-can-outline" color='grey' />}
                onPress={() => this.onDeleteConfirm(row.id)}
              />
            ))}
            {/*end loop*/}
          </List.Section>
          </ScrollView>

          <Button
              mode="contained"
              icon="plus"
              onPress={() => this.props.navigation.navigate('PeminjamanBukuInsertScreen', {peminjaman_id: this.state.peminjaman_id})}
              style={{margin:20}}
          >
            Insert Buku
          </Button>

          <Button
              mode="contained"
              icon="barcode-scan"
              onPress={() => this.props.navigation.navigate('PeminjamanBukuInsertBarcodeScreen', {peminjaman_id: this.state.peminjaman_id})}
              style={{margin:20}}
          >
            Insert via Barcode
          </Button>

          <Loading isLoading={this.state.isLoading} />

        </PaperProvider>
      )
  }
}

export default PeminjamanBukuListScreen;
