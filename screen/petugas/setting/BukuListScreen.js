import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, Avatar, List, Button, IconButton } from 'react-native-paper';

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';

class BukuListScreen extends Component {

  constructor(props) {
      super(props);

      this.state = {
        data: [],
        isLoading: false,
      };
  }

  componentDidMount() {
      this.getData();

      this._unsubscribe = this.props.navigation.addListener('focus', () => {
        this.getData();
      });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  async getData() {
      this.setState({isLoading:true});

      //query data supabase
      const { data, error } = await supabase
                                    .from('buku')
                                    .select('*, kategori_buku:kategori_id(nama)')
                                    .order('judul', {ascending:true})

      //memasukan respon ke state untuk loop data di render
      this.setState({data:data, isLoading:false});
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Buku" />
          </Appbar.Header>

          <ScrollView>
          <List.Section>
              {/*loop data state*/}
              {this.state.data && this.state.data.map((row,key) => (
                <List.Item
                  key={key}
                  title={row.judul}
                  description={'Kategori: '+row.kategori_buku.nama}
                  left={() => <Avatar.Text size={35} label={row.judul.charAt(0).toUpperCase()} style={{margin:10}} />}
                  right={props => <View style={{flexDirection:'row'}}>
                                      <IconButton icon="image" onPress={() => this.props.navigation.navigate('BukuSampulScreen', {id: row.id})} />
                                      <IconButton icon="pencil" onPress={() => this.props.navigation.navigate('BukuUpdateScreen', {id: row.id})} />
                                  </View>
                        }
                />
              ))}
              {/*end loop*/}
          </List.Section>
          </ScrollView>

          <Button
              mode="contained"
              icon="plus"
              onPress={() => this.props.navigation.navigate('BukuInsertScreen')}
              style={{margin:20}}
          >
            Insert Buku
          </Button>

        </PaperProvider>
      )
  }
}

export default BukuListScreen;
