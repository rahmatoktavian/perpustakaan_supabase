import * as React from 'react';
import { View, Dimensions, Image } from 'react-native';
import { Provider as PaperProvider, Appbar, List, Portal, Dialog, Text, ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { showMessage } from "react-native-flash-message";

import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

import supabase from '../../../config/supabase.js';
import Theme from '../../../config/Theme';
import storeApp from '../../../config/storeApp';
import Loading from '../../../component/Loading';
import dateFormat from '../../../component/dateFormat';

class PeminjamanInsertScreen extends React.Component {

  constructor(props) {
      super(props);

      //get redux variable
      this.state = storeApp.getState();
      storeApp.subscribe(()=>{
        this.setState(storeApp.getState());
      });

      this.state = {
          ...this.state,
          latitude: 0,
          longitude: 0,

          listMarker: [],
          markerDetail: [],
          markerDetailShow: false,
      };
  }

  componentDidMount() {
    this.getCurrLocation();
  }

  async getCurrLocation() {
    this.setState({isLoading:true});

    let {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
    } else {
      //mengampil lokasi (latitude & longitude)
      let currLocation = await Location.getLastKnownPositionAsync({});
      //let currLocation = await Location.getCurrentPositionAsync({});
      let currLatitude = currLocation.coords.latitude;
      let currLongitude = currLocation.coords.longitude;

      this.setState({latitude:currLatitude, longitude:currLongitude});
      this.getMarker(currLocation.coords);
    }

    this.setState({isLoading:false});
  }

  //fungsi marker/tanda di peta
  async getMarker(currLocation) {
    this.setState({isLoading:true});

    let listMarker = [];

    //marker lokasi handphone (marker biru)
    listMarker.push({title: 'Lokasi Saya', location:{latitude:currLocation.latitude, longitude:currLocation.longitude}, currLocation:true});

    //query data supabase
    const { data, error } = await supabase
                                  .from('anggota')
                                  .select('*')
                                  .order('nama', {ascending:true})

    //loop data api
    data.map(row => {
      //menambah marker dari data api, jika ada data lat & long (marker merah)
      if(row.latitude != null && row.longitude != null) {
        listMarker.push({title:row.nama, nim:row.nim, jurusan:row.jurusan, location:{latitude:parseFloat(row.latitude), longitude:parseFloat(row.longitude)}, currLocation:false});
      }
    })

    //set state marker & loading berhenti
    this.setState({listMarker: listMarker, isLoading:false});
  }

  getMarkerDetail(marker) {
    this.setState({markerDetailShow:true, markerDetail:marker});
  }

  onViewDistance() {
    let location = this.state.markerDetail.location;
    Linking.openURL('http://www.google.com/maps/place/'+location.latitude+','+location.longitude);
  }

  async onInsert(nim) {
    this.setState({isLoading:true});

    let tanggal_pinjam = dateFormat(new Date());

    let currDate = new Date();
    currDate.setDate(currDate.getDate() + 7);
    let tanggal_batas_kembali = dateFormat(currDate);

    //query data supabase
    const { data, error } = await supabase
                                  .from('peminjaman')
                                  .insert([{
                                      nim: nim,
                                      petugas_id: this.state.petugas_id,
                                      tanggal_pinjam: tanggal_pinjam,
                                      tanggal_batas_kembali: tanggal_batas_kembali,
                                  }])

    this.setState({isLoading:false});

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

    this.props.navigation.navigate('PeminjamanListScreen');
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Insert Peminjaman" />
          </Appbar.Header>

          {(this.state.latitude != 0 && this.state.longitude != 0) &&
          <View style={{flex:1}}>
            <MapView
              initialRegion={{
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              style={{width:windowWidth, height:windowHeight}}
            >
              {this.state.listMarker.map(marker => (

              <MapView.Marker
                coordinate={marker.location}
                title={marker.title}
                onPress={() => marker.currLocation == true ? {} : this.getMarkerDetail(marker)}
              >
                <IconButton
                    icon={marker.currLocation == true ? "map-marker-radius" : "account-circle"}
                    color={marker.currLocation == true ? "red" : Theme.colors.primary}
                    size={35}
                />
              </MapView.Marker>
              ))}
            </MapView>
          </View>
          }

          <Portal>
              <Dialog
                visible={this.state.markerDetailShow}
                onDismiss={() => this.setState({markerDetailShow:false})}
                style={Platform.OS == 'android' ? { position:'absolute', bottom:0, width:windowWidth, marginVertical:0, marginHorizontal:0 } : {top:-50, marginHorizontal:5} }
              >
                <Dialog.Title>{this.state.markerDetail.title}</Dialog.Title>
                <Dialog.ScrollArea style={{ maxHeight:(windowHeight*0.5)}}>
                  <Text>
                  NIM : {this.state.markerDetail.nim}
                  </Text>
                   <Text>
                  Jurusan : {this.state.markerDetail.jurusan}
                  </Text>
                </Dialog.ScrollArea>

                <Dialog.Actions>
                  <Button icon="plus" style={{ paddingRight:5 }} onPress={() => this.onInsert(this.state.markerDetail.nim)}>Peminjaman</Button>
                  <Button icon="navigation" style={{ paddingRight:5 }} onPress={() => this.onViewDistance()}>Jarak</Button>
                  <Button icon="close" style={{ paddingRight:5 }} onPress={() => this.setState({markerDetailShow:false})}>Close</Button>
                </Dialog.Actions>
              </Dialog>
          </Portal>

          <Loading isLoading={this.state.isLoading} />
        </PaperProvider>
      )
  }
}

export default PeminjamanInsertScreen;
