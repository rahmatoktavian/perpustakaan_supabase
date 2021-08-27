import React, { Component } from 'react';
import { View, ScrollView, FlatList } from 'react-native';
import { Provider as PaperProvider, Appbar, List, Portal, Modal, ActivityIndicator, Button, IconButton, Divider, Badge } from 'react-native-paper';
import * as Location from 'expo-location';

import supabase from '../../../config/supabase.js';
import Theme from '../../../config/Theme';
import storeApp from '../../../config/storeApp';
import Loading from '../../../component/Loading';
import dateFormatDB from '../../../component/dateFormatDB';

class PeminjamanListScreen extends Component {

  constructor(props) {
      super(props);

      //get redux variable
      this.state = storeApp.getState();
      storeApp.subscribe(()=>{
        this.setState(storeApp.getState());
      });

      this.state = {
        ...this.state,
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
                                    .from('peminjaman')
                                    .select('id, anggota:nim (nama), tanggal_pinjam, tanggal_batas_kembali')
                                    .eq('petugas_id', this.state.petugas_id)

      this.setState({data:data, isLoading:false});
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Content title="Peminjaman" />
          </Appbar.Header>

          <ScrollView>
          <List.Section>
              {/*loop data state*/}
              {this.state.data && this.state.data.map((row,key) => (
                <List.Item
                  title={row.anggota.nama}
                  description={'Tgl Pinjam: '+dateFormatDB(row.tanggal_pinjam)}
                  left={props => <Badge style={{ backgroundColor: Theme.colors.primary, margin: 10 }} size={40}>{row.anggota.nama.charAt(0)}</Badge>}
                  right={props =>
                        <View style={{flexDirection:'row'}}>
                          <IconButton icon="book" onPress={() => this.props.navigation.navigate('PeminjamanBukuListScreen', {peminjaman_id: row.id, nama: row.anggota.nama, tanggal_pinjam: row.tanggal_pinjam})} />
                          <IconButton icon="pencil" onPress={() => this.props.navigation.navigate('PeminjamanUpdateScreen', {id: row.id})} />
                        </View>}
                />
              ))}
              {/*end loop*/}
          </List.Section>
          </ScrollView>

          <Button
              mode="contained"
              icon="plus"
              onPress={() => this.props.navigation.navigate('PeminjamanInsertScreen')}
              style={{margin:20}}
          >
            Insert Peminjaman
          </Button>

          <Button
              mode="outlined"
              icon="google-maps"
              onPress={() => this.props.navigation.navigate('PeminjamanInsertMapScreen')}
              style={{marginHorizontal:20, marginBottom:10}}
          >
            Insert Peminjaman
          </Button>

          <Loading isLoading={this.state.isLoading} />
        </PaperProvider>
      )
  }
}

export default PeminjamanListScreen;
